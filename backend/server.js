const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const cors = require('cors');
const { initSocket } = require('./config/socket');
const path = require('path');
dotenv.config({ path: './config/config.env' });

// Route files
const auth = require('./routes/auth');
const message = require('./routes/message.js');
const chat = require('./routes/chat');
const upload = require('./routes/upload');
const { createServer } = require('http');
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
app.use('/api/upload', upload);

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

// initialize socket.io with our server (sets up auth and handlers)
initSocket(server).catch((err) =>
  console.warn('Socket init warning:', err && err.message),
);

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
