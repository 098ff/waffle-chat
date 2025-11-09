const express = require('express');
const {
  createChat,
  getChatsForUser,
  getMessagesByChatId,
  postMessageToChat,
  getChatMembers,
} = require('../controllers/chat');
const {
  getInvitationsForUser,
  acceptInvitation,
  rejectInvitation,
} = require('../controllers/invitation');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// Invitation routes
router.get('/invitations', getInvitationsForUser);
router.put('/invitations/:id/accept', acceptInvitation);
router.put('/invitations/:id/reject', rejectInvitation);

// Chat routes
router.post('/', createChat);
router.get('/', getChatsForUser);
router.get('/:id', getChatMembers);
router.get('/:id/messages', getMessagesByChatId);
router.post('/:id/messages', postMessageToChat);

module.exports = router;
