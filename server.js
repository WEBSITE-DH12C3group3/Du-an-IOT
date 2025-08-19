require('dotenv').config();
const http = require('http');
const app = require("./app.js");  // thêm .js cho chắc chắn
const dotenv = require("dotenv");

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Socket.IO
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*' } });
app.set('io', io);

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  socket.on('disconnect', () => console.log('❌ Client disconnected:', socket.id));
});

server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
