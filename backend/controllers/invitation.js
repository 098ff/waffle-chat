const Invitation = require('../models/Invitation.js');
const Chat = require('../models/Chat.js');
const { ErrorMessages } = require('../helper/error.js');

const getInvitationsForUser = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("USERRID:", req.user._id)
    console.log("CALLED")
    const invitations = await Invitation.find({
      invitee: userId,
      status: 'pending',
    })
      .populate('chat', 'name type')
      .populate('inviter', 'fullName email');

    res.status(200).json(invitations);
  } catch (err) {
    console.error('getInvitationsForUser', err);
    res.status(500).json({ message: ErrorMessages.SERVER_ERROR });
  }
};

const acceptInvitation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const invitation = await Invitation.findById(id);
    if (!invitation || invitation.invitee.toString() !== userId.toString()) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: 'Invitation already handled' });
    }

    invitation.status = 'accepted';
    await invitation.save();

    const chat = await Chat.findById(invitation.chat);
    chat.participants.push({ user: userId, role: 'member' });
    await chat.save();

    res.status(200).json({ message: 'Invitation accepted' });
  } catch (err) {
    console.error('acceptInvitation', err);
    res.status(500).json({ message: ErrorMessages.SERVER_ERROR });
  }
};

const rejectInvitation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const invitation = await Invitation.findById(id);
    if (!invitation || invitation.invitee.toString() !== userId.toString()) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: 'Invitation already handled' });
    }

    invitation.status = 'rejected';
    await invitation.save();

    res.status(200).json({ message: 'Invitation rejected' });
  } catch (err) {
    console.error('rejectInvitation', err);
    res.status(500).json({ message: ErrorMessages.SERVER_ERROR });
  }
};

module.exports = {
  getInvitationsForUser,
  acceptInvitation,
  rejectInvitation,
};
