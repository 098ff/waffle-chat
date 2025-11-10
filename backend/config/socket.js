const { Server } = require('socket.io');
const { socketAuthMiddleware } = require('../middleware/socket.auth');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

let io = null;
const userSocketMap = {};

function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

async function initSocket(server) {
  if (io) return io;

  io = new Server(server, {
    cors: {
      origin: [process.env.CLIENT_URL || 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // attach auth middleware
  io.use(socketAuthMiddleware);

  io.on('connection', async (socket) => {
    try {
      const userId = socket.userId;
      userSocketMap[userId] = socket.id;
      console.log('Socket connected for user', userId);

      // emit online users to all connected clients
      io.emit('getOnlineUsers', Object.keys(userSocketMap));

      // auto-join user's chats
      try {
        const chats = await Chat.find({ 'participants.user': userId }).select(
          '_id',
        );
        chats.forEach((c) => socket.join(c._id.toString()));
      } catch (err) {
        console.warn('Failed to auto-join chats for user', userId, err.message);
      }

      // join a chat room
      socket.on('join-room', async ({ chatId }, callback) => {
        try {
          const chat = await Chat.findById(chatId);
          if (!chat)
            return (
              callback &&
              callback({ status: 'error', message: 'Chat not found' })
            );

          const isMember = chat.participants.some(
            (p) => p.user.toString() === userId.toString(),
          );
          if (!isMember)
            return (
              callback && callback({ status: 'error', message: 'Not a member' })
            );

          socket.join(chatId);
          io.to(chatId).emit('member:joined', { chatId, userId });
          return callback && callback({ status: 'ok' });
        } catch (err) {
          console.error('join-room error', err.message);
          return callback && callback({ status: 'error' });
        }
      });

      socket.on('leave-room', ({ chatId }, callback) => {
        socket.leave(chatId);
        io.to(chatId).emit('member:left', { chatId, userId });
        return callback && callback({ status: 'ok' });
      });

      // typing indicator
      socket.on('typing', ({ chatId, typing }) => {
        socket.to(chatId).emit('typing', { chatId, userId, typing });
      });

      // create message
      socket.on('message:create', async (payload, callback) => {
        try {
          const { chatId, text, image } = payload;
          if (!chatId || (!text && !image)) {
            return (
              callback &&
              callback({ status: 'error', message: 'Invalid payload' })
            );
          }

          const chat = await Chat.findById(chatId);
          if (!chat)
            return (
              callback &&
              callback({ status: 'error', message: 'Chat not found' })
            );
          const isMember = chat.participants.some(
            (p) => p.user.toString() === userId.toString(),
          );
          if (!isMember)
            return (
              callback && callback({ status: 'error', message: 'Not a member' })
            );

          let imageUrl = null;
          if (image) {
            try {
              const cloudinary = require('./cloudinary');
              const uploadResponse = await cloudinary.uploader.upload(image);
              imageUrl = uploadResponse.secure_url;
            } catch (e) {
              console.warn('Image upload failed', e.message);
            }
          }

          const newMessage = await Message.create({
            senderId: userId,
            chatId,
            text,
            image: imageUrl,
          });
          
          // populate sender before emitting
          const populatedMessage = await Message.findById(newMessage._id).populate(
            'senderId',
            'fullName profilePic',
          );

          // update lastMessage on chat
          chat.lastMessage = newMessage._id;
          await chat.save();

          io.to(chatId).emit('message:new', populatedMessage);
          return callback && callback({ status: 'ok', message: populatedMessage });
        } catch (err) {
          console.error('message:create error', err.message);
          return callback && callback({ status: 'error' });
        }
      });

      // create audio message
      socket.on('message:audio', async (payload, callback) => {
        try {
          const { chatId, audioData } = payload;
          const userId = socket.userId;

          console.log('[message:audio] incoming payload:', {
            chatId,
            audioType: Object.prototype.toString.call(audioData),
            isBuffer: Buffer.isBuffer(audioData),
            hasByteLength: audioData && typeof audioData.byteLength === 'number',
            sampleLength: Array.isArray(audioData) ? audioData.length : undefined,
          });

          if (!chatId || !audioData) {
            return callback && callback({ status: 'error', message: 'Invalid payload' });
          }

          // Know type of audioData from above console.log then convert it!
          let audioBuffer = Buffer.from(new Uint8Array(audioData));

          const chat = await Chat.findById(chatId);
          if (!chat) return callback && callback({ status: 'error', message: 'Chat not found' });

          const isMember = chat.participants.some((p) => p.user.toString() === userId.toString());
          if (!isMember) return callback && callback({ status: 'error', message: 'Not a member' });

          // Upload to Cloudinary using streamifier
          const streamifier = require('streamifier');
          const cloudinary = require('./cloudinary');

          const uploadAudio = (buffer) => {
            return new Promise((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                {
                  resource_type: 'video',
                  format: 'webm',
                },
                (error, result) => {
                  if (error) return reject(error);
                  resolve(result);
                },
              );
              streamifier.createReadStream(buffer).pipe(uploadStream);
            });
          };

          let audioUrl = null;
          try {
            const uploadResponse = await uploadAudio(audioBuffer);
            console.log('[message:audio] upload success', {
              public_id: uploadResponse.public_id,
              secure_url: uploadResponse.secure_url,
            });
            audioUrl = uploadResponse.secure_url;
          } catch (e) {
            console.error('[message:audio] Audio upload failed:', e && e.message, e && e.stack);
            return callback && callback({ status: 'error', message: 'Upload failed', details: e && e.message });
          }

          // create and persist the audio message
          const newMessage = await Message.create({
            senderId: userId,
            chatId,
            audio: audioUrl,
          });

          const populatedMessage = await Message.findById(newMessage._id).populate(
            'senderId',
            'fullName profilePic',
          );

          chat.lastMessage = newMessage._id;
          await chat.save();

          io.to(chatId).emit('message:new', populatedMessage);
          return callback && callback({ status: 'ok', message: populatedMessage });
        } catch (err) {
          console.error('message:audio handler error', err && err.stack);
          return callback && callback({ status: 'error', message: 'Server error' });
        }
      });

      socket.on('disconnect', () => {
        delete userSocketMap[userId];
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
      });
    } catch (err) {
      console.error('Socket connection handler error', err.message);
    }
  });

  return io;
}

module.exports = {
  initSocket,
  getReceiverSocketId,
  userSocketMap,
  getIo: () => io,
};
