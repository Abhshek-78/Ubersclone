const { Server } = require('socket.io');
const userModel=require('./models/usermodel')
const captainModel=require('./models/captain.model')
const rideModel=require('./models/ride.model')
const mapService=require('./services/map.service')
let io;
const REQUEST_RADIUS_KM = Number(process.env.RIDE_REQUEST_RADIUS_KM) || 5;

function initializeSocket(server) {
    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);
        socket.on('join',async (data)=>{
            const {userId,userType}=data;
            if (!userId || !userType) {
                socket.emit('socket-error', { message: 'userId and userType are required to join' });
                return;
            }

            if (userType === 'user') {
                await userModel.findByIdAndUpdate(userId, {
                    socketId:socket.id
                });
            }else if(userType === 'captain'){
                const captain = await captainModel.findByIdAndUpdate(userId, {
                    socketId:socket.id,
                    status: 'active',
                    ...(data.location ? { location: data.location } : {}),
                }, { new: true });

                if (!captain) {
                    socket.emit('socket-error', { message: 'Captain account not found' });
                    return;
                }

                socket.emit('socket-joined', { userType, userId: captain._id });
            }
        });

        socket.on('captain-location', async ({ captainId, location }) => {
            if (!captainId || !location) return;
            await captainModel.findByIdAndUpdate(captainId, { location });
        });

        socket.on('captain-status', async ({ captainId, isOnline }) => {
            if (!captainId) return;
            await captainModel.findByIdAndUpdate(captainId, {
                status: isOnline ? 'active' : 'inactive',
                socketId: isOnline ? undefined : null,
            });
        });

        socket.on('accept-ride', (data) => handleRideDecision(socket, true, data));
        socket.on('reject-ride', (data) => handleRideDecision(socket, false, data));
        socket.on('start-ride', (data) => updateRideStatus(socket, 'ongoing', data));
        socket.on('complete-ride', (data) => updateRideStatus(socket, 'completed', data));



        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
            captainModel.findOneAndUpdate(
                { socketId: socket.id },
                { status: 'inactive', socketId: null },
            ).catch(() => {});
        });

    });

    return io;
}

async function handleRideDecision(socket, accepted, data = {}) {
    const { rideId, captainId } = data;
    if (!rideId || !captainId) return;

    if (!accepted) {
        const ride = await rideModel.findById(rideId).populate('user');
        if (ride?.user?.socketId) {
            io.to(ride.user.socketId).emit('ride-rejected', {
                rideId,
                captainId,
            });
        }
        return;
    }

    const ride = await rideModel.findOneAndUpdate(
        { _id: rideId, status: 'pending' },
        { captain: captainId, status: 'accept' },
        { new: true },
    ).select('+otp').populate('user').populate('captain');

    if (!ride) {
        socket.emit('ride-action-error', { rideId, message: 'Ride is no longer available' });
        return;
    }

    await captainModel.findByIdAndUpdate(captainId, { status: 'busy' });

    const captainDetails = {
        id: ride.captain._id,
        name: `${ride.captain.fullname.firstname} ${ride.captain.fullname.lastname || ''}`.trim(),
        email: ride.captain.email,
        vehicle: ride.captain.vehical,
        rating: ride.captain.rating || null,
    };

    if (ride.user?.socketId) {
        io.to(ride.user.socketId).emit('ride-accepted', {
            rideId: ride._id,
            pickup: ride.pickup,
            destination: ride.destination,
            fare: ride.fare,
            otp: ride.otp,
            captain: captainDetails,
        });
    }
}

async function updateRideStatus(socket, status, data = {}) {
    const { rideId, captainId } = data;
    if (!rideId || !captainId) return;

    const ride = await rideModel.findOneAndUpdate(
        { _id: rideId, captain: captainId, status: status === 'ongoing' ? 'accept' : 'ongoing' },
        { status },
        { new: true },
    ).select('+otp').populate('user').populate('captain');

    if (!ride) {
        socket.emit('ride-action-error', { rideId, message: 'Ride status could not be updated' });
        return;
    }

    if (status === 'completed') {
        await captainModel.findByIdAndUpdate(captainId, { status: 'active' });
    }

    if (ride.user?.socketId) {
        io.to(ride.user.socketId).emit(`ride-${status}`, {
            rideId: ride._id,
            status: ride.status,
            pickup: ride.pickup,
            destination: ride.destination,
            fare: ride.fare,
            otp: ride.otp,
            captain: ride.captain,
        });
    }
}

async function dispatchRideRequest(rideId) {
    if (!io) return [];

    const ride = await rideModel.findById(rideId).populate('user');
    if (!ride) return [];

    const pickup = await mapService.getAddressCoordinate(ride.pickup);
    const captains = await captainModel.find({
        status: 'active',
        socketId: { $nin: [null, ''] },
        'location.ltd': { $type: 'number' },
        'location.log': { $type: 'number' },
    }).lean();

    const nearbyCaptains = captains.filter((captain) => {
        const hasLocation = Number.isFinite(captain.location?.ltd)
            && Number.isFinite(captain.location?.log);

        // Keep connected captains eligible when browser location is unavailable.
        if (!hasLocation) return true;

        return distanceInKm(
            pickup.latitude,
            pickup.longitude,
            captain.location.ltd,
            captain.location.log,
        ) <= REQUEST_RADIUS_KM;
    });

    console.log(`Dispatching ride ${rideId} to ${nearbyCaptains.length} captain(s)`);

    const request = {
        rideId: ride._id,
        pickup: ride.pickup,
        destination: ride.destination,
        fare: ride.fare,
        vehicleType: ride.vehicleType,
        user: {
            id: ride.user?._id,
            name: `${ride.user?.fullname?.firstname || ''} ${ride.user?.fullname?.lastname || ''}`.trim(),
            email: ride.user?.email,
        },
    };

    nearbyCaptains.forEach((captain) => {
        const hasLocation = Number.isFinite(captain.location?.ltd)
            && Number.isFinite(captain.location?.log);
        const distanceToPickup = hasLocation
            ? `${distanceInKm(pickup.latitude, pickup.longitude, captain.location.ltd, captain.location.log).toFixed(1)} km`
            : 'Location unavailable';

        io.to(captain.socketId).emit('ride-request', {
            ...request,
            distanceToPickup,
        });
    });

    return nearbyCaptains;
}

function distanceInKm(latitude1, longitude1, latitude2, longitude2) {
    const earthRadiusKm = 6371;
    const latitudeDelta = (latitude2 - latitude1) * Math.PI / 180;
    const longitudeDelta = (longitude2 - longitude1) * Math.PI / 180;
    const value = Math.sin(latitudeDelta / 2) ** 2
        + Math.cos(latitude1 * Math.PI / 180)
        * Math.cos(latitude2 * Math.PI / 180)
        * Math.sin(longitudeDelta / 2) ** 2;
    return earthRadiusKm * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function sendMessageToSocketId(socketId, messageObject) {
    if (!io) {
        throw new Error('Socket has not been initialized.');
    }

    io.to(socketId).emit(messageObject.event, messageObject.data);
    
}

module.exports = {
    initializeSocket,
    sendMessageToSocketId,
    dispatchRideRequest,
};
