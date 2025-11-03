const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');

// Create a chat (private or group)
const createChat = async (req, res) => {
  try {
    const { type, name, participants } = req.body;
    const creator = req.user._id;

    if (!type || !['private', 'group'].includes(type)) {
      return res.status(400).json({ message: 'Invalid chat type' });
    }

    if (type === 'private') {
      // participants should be an array with exactly one other user
      if (!Array.isArray(participants) || participants.length !== 1) {
        return res.status(400).json({
          message: 'Private chat requires exactly one other participant',
        });
      }
      const otherId = participants[0];

      const creatorName = await User.findById(creator).then((u) => u.fullName);
      const otherUserName = await User.findById(otherId).then(
        (u) => u.fullName,
      );

      // build sorted key
      const ids = [creator.toString(), otherId.toString()].sort();
      const participantsSorted = ids.join('_');

      // find existing
      let chat = await Chat.findOne({ type: 'private', participantsSorted });
      if (chat) return res.status(200).json(chat);

      chat = await Chat.create({
        type: 'private',
        participants: [
          { user: creator, fullName: creatorName, role: 'member' },
          { user: otherId, fullName: otherUserName, role: 'member' },
        ],
        createdBy: creator,
        participantsSorted,
      });

      return res.status(201).json(chat);
    }

    // group chat
    if (!Array.isArray(participants) || participants.length < 1) {
      return res
        .status(400)
        .json({ message: 'Group chat requires one or more participants' });
    }

    const uniqueParts = Array.from(
      new Set(participants.map((p) => p.toString())),
    );
    const participantsDocs = uniqueParts.map((p) => ({
      user: p,
      role: p === creator.toString() ? 'admin' : 'member',
    }));

    const chat = await Chat.create({
      type: 'group',
      name: name || 'Group chat',
      participants: participantsDocs,
      createdBy: creator,
    });

    res.status(201).json(chat);
  } catch (err) {
    console.error('createChat error', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// List chats for current user
const getChatsForUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const chats = await Chat.find({ 'participants.user': userId }).sort({
      updatedAt: -1,
    });
    res.status(200).json(chats);
  } catch (err) {
    console.error('getChatsForUser', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get messages for a chat (pagination basic)
const getMessagesByChatId = async (req, res) => {
  try {
    const { id: chatId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    // ensure user is participant
    const isMember = chat.participants.some(
      (p) => p.user.toString() === userId.toString(),
    );
    if (!isMember)
      return res.status(403).json({ message: 'Not a member of this chat' });

    const messages = await Message.find({ chatId }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (err) {
    console.error('getMessagesByChatId', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Post message to chat (fallback REST)
const postMessageToChat = async (req, res) => {
  try {
    const { id: chatId } = req.params;
    const { text, image } = req.body;
    const senderId = req.user._id;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    const isMember = chat.participants.some(
      (p) => p.user.toString() === senderId.toString(),
    );
    if (!isMember)
      return res.status(403).json({ message: 'Not a member of this chat' });

    let imageUrl = null;
    if (image) {
      const uploadResponse =
        await require('../config/cloudinary.js').uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      chatId,
      text,
      image: imageUrl,
    });

    // update lastMessage
    chat.lastMessage = newMessage._id;
    await chat.save();

    // Broadcast via socket if possible
    try {
      const { getIo } = require('../config/socket');
      const io = getIo();
      if (io) io.to(chatId).emit('message:new', newMessage);
    } catch (socketErr) {
      // ignore socket errors here
    }

    res.status(201).json(newMessage);
  } catch (err) {
    console.error('postMessageToChat', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createChat,
  getChatsForUser,
  getMessagesByChatId,
  postMessageToChat,
};
