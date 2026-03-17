const jwt = require('jsonwebtoken');

let _io = null;

const initSocket = (httpServer) => {
  const { Server } = require('socket.io');

  _io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  _io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required.'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error('Invalid token.'));
    }
  });

  _io.on('connection', (socket) => {
    // Each user joins a private room keyed by their user ID
    socket.join(`user:${socket.userId}`);

    socket.on('disconnect', () => {});
  });

  return _io;
};

// Emit a notification event to a specific user (all their connected devices)
const emitToUser = (userId, notification) => {
  if (_io) {
    _io.to(`user:${userId}`).emit('notification', notification);
  }
};

module.exports = { initSocket, emitToUser };
