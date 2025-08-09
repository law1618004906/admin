// socket.js - CommonJS version for production
const { Server } = require('socket.io');

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Handle messages
    socket.on('message', (msg) => {
      try {
        // Echo: broadcast message only the client who send the message
        socket.emit('message', {
          text: `Echo: ${msg?.text}`,
          senderId: 'system',
          timestamp: new Date().toISOString(),
        });
      } catch (e) {
        console.error('socket message handler error', e);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Send welcome message
    socket.emit('message', {
      text: 'Welcome to WebSocket Echo Server!',
      senderId: 'system',
      timestamp: new Date().toISOString(),
    });
  });
};

module.exports = { setupSocket };
