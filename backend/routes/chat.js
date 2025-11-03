const express = require('express');
const {
  createChat,
  getChatsForUser,
  getMessagesByChatId,
  postMessageToChat,
} = require('../controllers/chat');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', createChat);
router.get('/', getChatsForUser);
router.get('/:id/messages', getMessagesByChatId);
router.post('/:id/messages', postMessageToChat);

module.exports = router;
