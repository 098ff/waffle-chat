const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const cors = require('cors');
const { Server } = require('socket.io');
const path = require('path');

// Route files
const auth = require('./routes/auth');
const message = require('./routes/message.js');
const chat = require('./routes/chat');
const { createServer } = require('http');
dotenv.config({ path: './config/config.env' });
const app = express();
const server = createServer(app);
const { join } = require('node:path');

// Query parser for able express to handle with complex query parameter by call lib qs
app.set('query parser', 'extended');

// Body parser
app.use(express.json());
// Database connection
connectDB();

// Cookie parser
app.use(cookieParser());

app.use(cors());

// Mount routers
app.use('/api/auth', auth);
app.use('/api/messages', message);
app.use('/api/chats', chat);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5003',
    methods: ['GET', 'POST'],
  },
  connectionStateRecovery: {},
});

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('request', (arg1, arg2, callback) => {
    console.log(arg1); // { foo: 'bar' }
    console.log(arg2); // 'baz'
    callback({
      status: 'ok',
    });
  });
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

// Use || 5000 for running in window
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`,
  );
});

process.on('unhandledRejection', (err, promise) => {
  console.log(`Unhandled Rejection at: ${promise}, reason: ${err}`);
  server.close(() => process.exit(1));
});
