const mongoose = require('mongoose');

const ParticipantSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['member', 'admin'], default: 'member' },
  joinedAt: { type: Date, default: Date.now },
});

const ChatSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['private', 'group'],
      required: true,
    },
    name: {
      type: String,
    },
    participants: [ParticipantSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    metadata: {
      avatarUrl: String,
      description: String,
    },
    participantsSorted: {
      type: String,
      index: true,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
  },
  { timestamps: true },
);

// For private chats, ensure uniqueness by sorted participant ids
ChatSchema.index(
  { type: 1, participantsSorted: 1 },
  { unique: true, sparse: true },
);

module.exports = mongoose.model('Chat', ChatSchema);
