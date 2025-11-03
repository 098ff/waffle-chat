const ErrorMessages = {
  USER_NOT_FOUND: 'User not found',
  CHAT_NOT_FOUND: 'Chat not found',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  INVALID_INPUT: 'Invalid input data',
  CHAT_ALREADY_EXISTS: 'Chat already exists',
  SERVER_ERROR: 'An unexpected server error occurred',
  INVALID_CHAT_TYPE: 'Invalid chat type',
  PRIVATE_CHAT_ONE_PARTICIPANT:
    'Private chat requires exactly one other participant',
  GROUP_CHAT_REQUIRES_PARTICIPANTS:
    'Group chat requires one or more participants',
  NOT_MEMBER: 'Not a member of this chat',
  INVALID_CREDENTIALS: 'Invalid credentials',
  EMAIL_PASSWORD_REQUIRED: 'Please provide an email and password',
  INTERNAL_SERVER_ERROR: 'Internal server error',
  LOGGED_OUT_SUCCESS: 'Logged out successfully',
  TEXT_OR_IMAGE_REQUIRED: 'Text or image is required.',
  CANNOT_MESSAGE_YOURSELF: 'Cannot send messages to yourself.',
  RECEIVER_NOT_FOUND: 'Receiver not found.',
};

module.exports = { ErrorMessages };
