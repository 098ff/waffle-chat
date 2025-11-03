const express = require('express');
const {
  getAllContacts,
  getChatPartners,
  getMessagesByUserId,
  sendMessage,
} = require('../controllers/message');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all message routes
router.use(require('../middleware/auth').protect);

router.get('/contacts', getAllContacts);
router.get('/chats', getChatPartners);
router.get('/:id', getMessagesByUserId);
router.post('/send/:id', sendMessage);

module.exports = router;
