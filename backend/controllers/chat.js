const { ErrorMessages } = require('../helper/error.js');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');

// Create a chat (private or group)
const createChat = async (req, res) => {
  try {
    const { type, name, participants } = req.body;
    const creator = req.user._id;

    if (!type || !['private', 'group'].includes(type)) {
      return res.status(400).json({ message: ErrorMessages.INVALID_CHAT_TYPE });
    }

    if (type === 'private') {
      // participants should be an array with exactly one other user
      if (!Array.isArray(participants) || participants.length !== 1) {
        return res.status(400).json({
          message: ErrorMessages.PRIVATE_CHAT_ONE_PARTICIPANT,
        });
      }
      const otherId = participants[0];

      // build sorted key
      const ids = [creator.toString(), otherId.toString()].sort();
      const participantsSorted = ids.join('_');

      // find existing
      let chat = await Chat.findOne({ type: 'private', participantsSorted });
      if (chat)
        return res
          .status(400)
          .json({ message: ErrorMessages.CHAT_ALREADY_EXISTS });

      chat = await Chat.create({
        type: 'private',
        participants: [
          { user: creator, fullName: 'Creator Name', role: 'member' }, // Placeholder
          { user: otherId, fullName: 'Other User Name', role: 'member' }, // Placeholder
        ],
        createdBy: creator,
        participantsSorted,
      });

      return res.status(201).json(chat);
    }

    if (!Array.isArray(participants) || participants.length < 1) {
      return res
        .status(400)
        .json({ message: ErrorMessages.GROUP_CHAT_REQUIRES_PARTICIPANTS });
    }

    const creatorIdStr = creator.toString();

    const allParticipantIds = [
      creatorIdStr,
      ...participants.map((p) => p.toString()),
    ];

    const uniqueParticipantIds = Array.from(new Set(allParticipantIds));

    const participantsDocs = uniqueParticipantIds.map((pId) => ({
      user: pId,
      role: pId === creatorIdStr ? 'admin' : 'member',
    }));

    const participantsSorted = [...uniqueParticipantIds].sort().join('_');

    let existingGroupChat = await Chat.findOne({
      type: 'group',
      participantsSorted,
    });
    if (existingGroupChat) {
      return res
        .status(400)
        .json({ message: ErrorMessages.CHAT_ALREADY_EXISTS });
    }

    const chat = await Chat.create({
      type: 'group',
      name: name || 'Group chat',
      participants: participantsDocs,
      createdBy: creator,
      participantsSorted: participantsSorted, 
    });

    res.status(201).json(chat);
  } catch (err) {
    console.error('createChat error', err);
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ message: ErrorMessages.CHAT_ALREADY_EXISTS });
    }
    res.status(500).json({ message: ErrorMessages.SERVER_ERROR });
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
    res.status(500).json({ message: ErrorMessages.SERVER_ERROR });
  }
};

// Get messages for a chat (pagination basic)
const getMessagesByChatId = async (req, res) => {
  try {
    const { id: chatId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findById(chatId);
    if (!chat)
      return res.status(404).json({ message: ErrorMessages.CHAT_NOT_FOUND });

    // ensure user is participant
    const isMember = chat.participants.some(
      (p) => p.user.toString() === userId.toString(),
    );
    if (!isMember)
      return res.status(403).json({ message: ErrorMessages.NOT_MEMBER });

    const messages = await Message.find({ chatId }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (err) {
    console.error('getMessagesByChatId', err.message);
    res.status(500).json({ message: ErrorMessages.SERVER_ERROR });
  }
};

// Post message to chat (fallback REST)
const postMessageToChat = async (req, res) => {
  try {
    const { id: chatId } = req.params;
    const { text, image } = req.body;
    const senderId = req.user._id;

    const chat = await Chat.findById(chatId);
    if (!chat)
      return res.status(404).json({ message: ErrorMessages.CHAT_NOT_FOUND });

    const isMember = chat.participants.some(
      (p) => p.user.toString() === senderId.toString(),
    );
    if (!isMember)
      return res.status(403).json({ message: ErrorMessages.NOT_MEMBER });

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
    res.status(500).json({ message: ErrorMessages.SERVER_ERROR });
  }
};

module.exports = {
  createChat,
  getChatsForUser,
  getMessagesByChatId,
  postMessageToChat,
};
