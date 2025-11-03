// scripts/test-socket.js
const { io } = require('socket.io-client');

if (process.argv.length < 4) {
  console.error('Usage: node test-socket.js <SERVER_URL> <JWT_TOKEN> [chatId]');
  process.exit(1);
}

const SERVER = process.argv[2]; // e.g. http://localhost:5000
const TOKEN = process.argv[3];
const CHAT_ID = process.argv[4] || null;

const socket = io(SERVER, {
  auth: { token: TOKEN },
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log('connected', socket.id);

  if (CHAT_ID) {
    socket.emit('join-room', { chatId: CHAT_ID }, (ack) => {
      console.log('join-room ack', ack);
    });
  }

  // send a realtime message after joining (if CHAT_ID supplied)
  setTimeout(() => {
    if (CHAT_ID) {
      socket.emit('message:create', { chatId: CHAT_ID, text: 'Hello from socket test' }, (ack) => {
        console.log('message:create ack', ack);
      });
    } else {
      console.log('No chatId provided. Listening only.');
    }
  }, 1000);
});

socket.on('message:new', (msg) => {
  console.log('new message received', msg);
});

socket.on('typing', (data) => {
  console.log('typing event', data);
});

socket.on('connect_error', (err) => {
  console.error('connect_error', err.message, err.data);
});

//node tests/test-socket.js http://localhost:5000 eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MDgyNTdlNWNlMWI1YWJmNzBiNTg5MiIsImlhdCI6MTc2MjE0NDEyMiwiZXhwIjoxNzY0NzM2MTIyfQ.snanxiyMT0sVMGv1SbYqbrbxbqCOqgayT7maiJ2FqRw 690826745ce1b5abf70b589c
//node tests/test-socket.js http://localhost:5000 eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MDgyNjA3NWNlMWI1YWJmNzBiNTg5NyIsImlhdCI6MTc2MjE0NDI2NiwiZXhwIjoxNzY0NzM2MjY2fQ.eSGE50zIDMCWwzr2iLDNIbnS1Yb6T8t8COgZZRBgVSM 690826745ce1b5abf70b589c
