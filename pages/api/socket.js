import { Server } from "socket.io";

const SocketHandler = (req, res) => {
    console.log("Socket API endpoint called");

    if (res.socket.server.io) {
        console.log("Socket.io server already running");
        res.end();
        return;
    }

    console.log("Initializing new Socket.io server");
    const io = new Server(res.socket.server, {
        path: '/api/socketio',
        addTrailingSlash: false,
        cors: {
            origin: process.env.NODE_ENV === 'production' 
                ? process.env.NEXT_PUBLIC_BASE_URL 
                : '*',
            methods: ['GET', 'POST']
        },
        connectionStateRecovery: {
            maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
        }
    });

    io.on('connection', (socket) => {
        console.log(`New client connected: ${socket.id}`);

        socket.on('join-room', (roomId, userId) => {
            try {
                if (!roomId || !userId) {
                    throw new Error('Missing roomId or userId');
                }

                console.log(`User ${userId} joining room ${roomId}`);
                socket.join(roomId);
                socket.broadcast.to(roomId).emit('user-connected', userId);

                // Store user data for reconnection handling
                socket.data.currentRoom = roomId;
                socket.data.userId = userId;
            } catch (error) {
                console.error(`Error in join-room:`, error);
                socket.emit('error', 'Failed to join room');
            }
        });

        socket.on('user-toggle-audio', (userId, roomId) => {
            try {
                if (!roomId || !userId) return;
                socket.broadcast.to(roomId).emit('user-toggle-audio', userId);
            } catch (error) {
                console.error(`Error in user-toggle-audio:`, error);
            }
        });

        socket.on('user-toggle-video', (userId, roomId) => {
            try {
                if (!roomId || !userId) return;
                socket.broadcast.to(roomId).emit('user-toggle-video', userId);
            } catch (error) {
                console.error(`Error in user-toggle-video:`, error);
            }
        });

        socket.on('user-leave', (userId, roomId) => {
            try {
                if (!roomId || !userId) return;
                socket.broadcast.to(roomId).emit('user-leave', userId);
                socket.leave(roomId);
            } catch (error) {
                console.error(`Error in user-leave:`, error);
            }
        });

        socket.on('disconnect', () => {
            try {
                const { currentRoom, userId } = socket.data;
                if (currentRoom && userId) {
                    socket.broadcast.to(currentRoom).emit('user-leave', userId);
                }
                console.log(`Client disconnected: ${socket.id}`);
            } catch (error) {
                console.error(`Error in disconnect handler:`, error);
            }
        });

        socket.on('error', (error) => {
            console.error(`Socket error for ${socket.id}:`, error);
        });
    });

    res.socket.server.io = io;
    res.end();
};

export default SocketHandler;

// Disable body parsing for this route
export const config = {
    api: {
        bodyParser: false,
    },
};