const { Server } = require('socket.io');
const userModel=require('./models/usermodel')

const captainModel=require('./models/captain.model')
let io;

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
            if (userType === 'user') {
                await userModel.findByIdAndUpdate(userId,{
                    socketId:socket.id
                });
            }else if(userType === 'captain'){
                await captainModel.findByIdAndUpdate(userId,{sockedId:socket.id})
            }
        });



        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });

    });

    return io;
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
};
