const { Server } = require('socket.io');
const userModel=require('./models/usermodel')
const captainModel=require('./models/captain.model')
const rideModel=require('./models/ride.model')
const mapService=require('./services/map.service')
let io;
const REQUEST_RADIUS_KM = Number(process.env.RIDE_REQUEST_RADIUS_KM) || 5;
const ETA_REFRESH_MS = 15000;
const etaCache = new Map();

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
                const user = await userModel.findByIdAndUpdate(userId, {
                    socketId:socket.id
                });
                if (!user) {
                    socket.emit('socket-error', { message: 'User account not found' });
                    return;
                }
            }else if(userType === 'captain'){
                const captain = await captainModel.findByIdAndUpdate(userId, {
                    socketId:socket.id,
                    status: 'active',
                    ...(data.location ? { location: data.location } : {}),
                }, { returnDocument: 'after' });

                if (!captain) {
                    socket.emit('socket-error', { message: 'Captain account not found' });
                    return;
                }

                await markCaptainOnline(userId);

                socket.emit('socket-joined', { userType, userId: captain._id });
            }
        });

        socket.on('captain-location', async ({ captainId, location }) => {
            if (!captainId || !location) return;
            await captainModel.findByIdAndUpdate(captainId, { location });

            const ride = await rideModel.findOne({ captain: captainId, status: { $in: ['accept', 'ongoing'] } })
                .populate('user', 'socketId');
            if (!ride) return;

            const phase = ride.status === 'ongoing' ? 'ongoing' : 'pickup';
            const target = phase === 'ongoing' ? ride.destination : ride.pickup;

            const cached = etaCache.get(String(captainId));
            let eta = cached?.data;
            if (!cached || cached.phase !== phase || Date.now() - cached.createdAt >= ETA_REFRESH_MS) {
                try {
                    const route = await mapService.getLiveRouteFromCoordinates(
                        { latitude: Number(location.ltd), longitude: Number(location.log) },
                        target,
                    );
                    eta = {
                        etaSeconds: Math.max(0, Math.round(route.duration)),
                        distanceMeters: Math.max(0, Math.round(route.distance)),
                        route: route.geometry,
                        destinationLocation: route.destination,
                    };
                    etaCache.set(String(captainId), { createdAt: Date.now(), data: eta, phase });
                } catch (error) {
                    console.error('Unable to calculate captain ETA:', error.message);
                }
            }

            const update = {
                rideId: ride._id,
                location,
                phase,
                ...(eta || {}),
            };
            socket.emit('captain-location', update);
            if (ride.user?.socketId) io.to(ride.user.socketId).emit('captain-location', update);
        });

        socket.on('captain-status', async ({ captainId, isOnline }) => {
            if (!captainId) return;
            if (isOnline) {
                await markCaptainOnline(captainId);
                await captainModel.findByIdAndUpdate(captainId, { status: 'active' });
            } else {
                await markCaptainOffline(captainId);
                await captainModel.findByIdAndUpdate(captainId, { status: 'inactive', socketId: null });
            }
        });

        socket.on('accept-ride', (data) => handleRideDecision(socket, true, data));
        socket.on('reject-ride', (data) => handleRideDecision(socket, false, data));
        socket.on('cancel-ride', (data) => handleRideCancellation(socket, data));
        socket.on('start-ride', (data) => updateRideStatus(socket, 'ongoing', data));
        socket.on('complete-ride', (data) => updateRideStatus(socket, 'completed', data));



        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
            captainModel.findOneAndUpdate(
                { socketId: socket.id },
                { socketId: null },
            ).then((captain) => captain && markCaptainOffline(captain._id)).catch(() => {});
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
        { returnDocument: 'after' },
    ).select('+otp').populate('user').populate('captain');

    if (!ride) {
        socket.emit('ride-action-error', { rideId, message: 'Ride is no longer available' });
        return;
    }

    await captainModel.findByIdAndUpdate(captainId, { status: 'busy' });
    await captainModel.findByIdAndUpdate(captainId, { $inc: { requestsAccepted: 1 } });

    let initialRoute = null;
    const captainLocation = ride.captain?.location;
    if (Number.isFinite(Number(captainLocation?.ltd)) && Number.isFinite(Number(captainLocation?.log))) {
        try {
            const route = await mapService.getLiveRouteFromCoordinates(
                { latitude: Number(captainLocation.ltd), longitude: Number(captainLocation.log) },
                ride.pickup,
            );
            initialRoute = route.geometry;
        } catch (error) {
            console.error('Unable to calculate initial pickup route:', error.message);
        }
    }

    const captainDetails = {
        id: ride.captain._id,
        name: `${ride.captain.fullname.firstname} ${ride.captain.fullname.lastname || ''}`.trim(),
        email: ride.captain.email,
        phone: ride.captain.phone || '',
        vehicle: ride.captain.vehical,
        rating: ride.captain.rating || null,
        location: ride.captain.location || null,
    };

    const acceptedRide = {
        rideId: ride._id,
        pickup: ride.pickup,
        destination: ride.destination,
        route: initialRoute,
        fare: ride.fare,
        otp: ride.otp,
        user: {
            id: ride.user?._id,
            name: `${ride.user?.fullname?.firstname || ''} ${ride.user?.fullname?.lastname || ''}`.trim(),
            email: ride.user?.email || '',
            phone: ride.user?.phone || '',
        },
        captain: captainDetails,
    };

    if (ride.user?.socketId) {
        io.to(ride.user.socketId).emit('ride-accepted', acceptedRide);
    }
    socket.emit('ride-accepted-captain', acceptedRide);
}

async function handleRideCancellation(socket, data = {}) {
    const { rideId, userId } = data;
    if (!rideId || !userId) return;

    const ride = await rideModel.findOneAndUpdate(
        { _id: rideId, user: userId, status: { $in: ['accept', 'ongoing'] } },
        { status: 'cancel' },
        { returnDocument: 'after' },
    ).populate('captain', 'socketId');

    if (!ride) {
        socket.emit('ride-action-error', { rideId, message: 'Ride could not be cancelled' });
        return;
    }

    if (ride.captain?._id) {
        await captainModel.findByIdAndUpdate(ride.captain._id, {
            status: 'active',
        });
        etaCache.delete(String(ride.captain._id));
    }

    const cancellation = { rideId: ride._id, status: ride.status };
    socket.emit('ride-cancelled', cancellation);
    if (ride.captain?.socketId) io.to(ride.captain.socketId).emit('ride-cancelled', cancellation);
}

async function updateRideStatus(socket, status, data = {}) {
    const { rideId, captainId } = data;
    if (!rideId || !captainId) return;

    const ride = await rideModel.findOneAndUpdate(
        { _id: rideId, captain: captainId, status: status === 'ongoing' ? 'accept' : 'ongoing' },
        { status },
        { returnDocument: 'after' },
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

    const captains = await captainModel.find({
        status: 'active',
        socketId: { $nin: [null, ''] },
    }).lean();

    let pickup = null;
    try {
        pickup = await mapService.getAddressCoordinate(ride.pickup);
    } catch (error) {
        // A routing outage must not prevent nearby captains from seeing the request.
        console.error('Unable to geocode ride pickup for dispatch:', error.message);
    }

    const requestedVehicleType = normalizeVehicleType(ride.vehicleType);
    const nearbyCaptains = captains.filter((captain) => {
        if (normalizeVehicleType(captain.vehical?.vehicaltype) !== requestedVehicleType) return false;

        const hasLocation = Number.isFinite(captain.location?.ltd)
            && Number.isFinite(captain.location?.log);

        // Keep connected captains eligible when browser location is unavailable.
        if (!pickup || !hasLocation) return true;

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
            phone: ride.user?.phone || '',
        },
    };

    nearbyCaptains.forEach((captain) => {
        const hasLocation = Number.isFinite(captain.location?.ltd)
            && Number.isFinite(captain.location?.log);
        const distanceToPickup = pickup && hasLocation
            ? `${distanceInKm(pickup.latitude, pickup.longitude, captain.location.ltd, captain.location.log).toFixed(1)} km`
            : 'Location unavailable';

        io.to(captain.socketId).emit('ride-request', {
            ...request,
            distanceToPickup,
        });
    });

    await captainModel.updateMany(
        { _id: { $in: nearbyCaptains.map((captain) => captain._id) } },
        { $inc: { requestsOffered: 1 } },
    );

    return nearbyCaptains;
}

async function markCaptainOnline(captainId) {
    const captain = await captainModel.findById(captainId).select('onlineSince');
    if (captain && !captain.onlineSince) {
        await captainModel.findByIdAndUpdate(captainId, { onlineSince: new Date() });
    }
}

async function markCaptainOffline(captainId) {
    const captain = await captainModel.findById(captainId).select('onlineSince');
    if (!captain?.onlineSince) return;

    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - captain.onlineSince.getTime()) / 1000));
    await captainModel.findByIdAndUpdate(captainId, {
        $inc: { totalOnlineSeconds: elapsedSeconds },
        $unset: { onlineSince: 1 },
    });
}

function normalizeVehicleType(vehicleType) {
    const normalized = String(vehicleType || '').trim().toLowerCase();
    if (normalized === 'motorcycle' || normalized === 'bike' || normalized === 'motorbike') {
        return 'bike';
    }
    if (normalized === 'car' || normalized === 'auto') return normalized;
    return '';
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
