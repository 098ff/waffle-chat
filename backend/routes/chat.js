const express = require('express');
const {
  createChat,
  getChatsForUser,
  getMessagesByChatId,
  postMessageToChat,
} = require('../controllers/chat');
const {
  getInvitationsForUser,
  acceptInvitation,
  rejectInvitation,
} = require('../controllers/invitation');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// Chat routes
router.post('/', createChat);
router.get('/', getChatsForUser);
router.get('/:id/messages', getMessagesByChatId);
router.post('/:id/messages', postMessageToChat);

// Invitation routes
router.get('/invitations', getInvitationsForUser);
router.put('/invitations/:id/accept', acceptInvitation);
router.put('/invitations/:id/reject', rejectInvitation);

module.exports = router;
