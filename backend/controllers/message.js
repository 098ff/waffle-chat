const cloudinary = require('../config/cloudinary.js');
const { getReceiverSocketId, getIo } = require('../config/socket');
const { ErrorMessages } = require('../helper/error.js');
// Use the new chat-aware message model
const Message = require('../models/Message.js');
const User = require('../models/User.js');
// const Group = require('../models/Group.js');

const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select('-password');
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log('Error in getAllContacts:', error);
    res.status(500).json({ message: ErrorMessages.SERVER_ERROR });
  }
};

const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
      chatId: null,
    }).sort({ createdAt: 1 });
    // .populate('senderId', 'fullName profilePic');

    res.status(200).json(messages);
  } catch (error) {
    console.log('Error in getMessages controller: ', error.message);
    res.status(500).json({ error: ErrorMessages.INTERNAL_SERVER_ERROR });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image) {
      return res
        .status(400)
        .json({ message: ErrorMessages.TEXT_OR_IMAGE_REQUIRED });
    }
    if (senderId.equals(receiverId)) {
      return res
        .status(400)
        .json({ message: ErrorMessages.CANNOT_MESSAGE_YOURSELF });
    }
    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res
        .status(404)
        .json({ message: ErrorMessages.RECEIVER_NOT_FOUND });
    }

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // Socket.IO
    const receiverSocketId = getReceiverSocketId(receiverId);
    const io = getIo();
    if (io && receiverSocketId) {
      // emit directly to socket id
      io.to(receiverSocketId).emit('newMessage', newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log('Error in sendMessage controller: ', error.message);
    res.status(500).json({ error: ErrorMessages.INTERNAL_SERVER_ERROR });
  }
};

// const sendGroupMessage = async (req, res) => {
//   try {
//     const { text, image } = req.body;
//     const { id: groupId } = req.params; // รับ groupId จาก params
//     const senderId = req.user._id;

//     if (!text && !image) {
//       return res.status(400).json({ message: 'Text or image is required.' });
//     }

//     const group = await Group.findById(groupId);
//     if (!group) {
//       return res.status(404).json({ message: 'Group not found.' });
//     }

//     if (!group.members.includes(senderId)) {
//       return res.status(403).json({ message: 'You are not a member of this group.' });
//     }

//     let imageUrl;
//     if (image) {
//       const uploadResponse = await cloudinary.uploader.upload(image);
//       imageUrl = uploadResponse.secure_url;
//     }

//     const newMessage = new Message({
//       senderId,
//       groupId,
//       text,
//       image: imageUrl,
//     });

//     await newMessage.save();

//     // Socket.IO
//     io.to(groupId).emit('newGroupMessage', newMessage);

//     res.status(201).json(newMessage);
//   } catch (error) {
//     console.log('Error in sendGroupMessage controller: ', error.message);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// const getMessagesByGroupId = async (req, res) => {
//   try {
//     const { id: groupId } = req.params;
//     const userId = req.user._id;

//     // ตรวจสอบว่าผู้ใช้เป็นสมาชิกกลุ่ม (เพื่อความปลอดภัย)
//     const group = await Group.findById(groupId);
//     if (!group || !group.members.includes(userId)) {
//          return res.status(403).json({ message: "Cannot access this group's messages." });
//     }

//     const messages = await Message.find({
//       groupId: groupId,
//     });
//     // .populate('senderId', 'fullName profilePic');

//     res.status(200).json(messages);
//   } catch (error) {
//     console.log('Error in getMessagesByGroupId controller: ', error.message);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
      chatId: null, // only private 1:1 messages
    });

    const chatPartnerIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString(),
        ),
      ),
    ];

    const chatPartners = await User.find({
      _id: { $in: chatPartnerIds },
    }).select('-password');
    res.status(200).json(chatPartners);
  } catch (error) {
    console.error('Error in getChatPartners: ', error.message);
    res.status(500).json({ error: ErrorMessages.INTERNAL_SERVER_ERROR });
  }
};

module.exports = {
  getAllContacts,
  getMessagesByUserId,
  sendMessage,
  getChatPartners,
  //   sendGroupMessage,
  //   getMessagesByGroupId,
};
