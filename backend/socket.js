import { Server } from 'socket.io';

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected to socket:', socket.id);
    let activeRoomId = null;

    socket.on('join-room', ({ roomId }) => {
      const userId = socket.id;
      activeRoomId = roomId;
      const usersInRoom = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
        .filter((id) => id !== socket.id);

      socket.join(roomId);
      console.log(`User ${userId} joined room ${roomId}`);
      
      socket.emit('all-users', usersInRoom);
      socket.to(roomId).emit('user-connected', userId);
    });

    // Listen for WebRTC signals (simple-peer)
    socket.on('signal', (data) => {
      io.to(data.userToSignal).emit('user-joined', {
        signal: data.signal,
        callerID: socket.id
      });
    });

    socket.on('returning-signal', (data) => {
      io.to(data.callerID).emit('receiving-returned-signal', {
        signal: data.signal,
        id: socket.id
      });
    });

    // Collaborative coding
    socket.on('code-change', (code) => {
      if (activeRoomId) socket.to(activeRoomId).emit('code-update', code);
    });

    // Live chat
    socket.on('chat-message', (message) => {
      if (activeRoomId) socket.to(activeRoomId).emit('new-message', message);
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.id} disconnected from room ${activeRoomId || 'unknown'}`);
      if (activeRoomId) socket.to(activeRoomId).emit('user-disconnected', socket.id);
    });
  });

  return io;
};
