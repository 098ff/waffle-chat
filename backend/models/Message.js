const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Optional for chat/group messages
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      default: null,
      index: true,
    },
    text: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    image: {
      type: String,
    },
    audio: { 
      type: String 
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent',
    },
    readBy: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        readAt: { type: Date },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model('Message', MessageSchema);
