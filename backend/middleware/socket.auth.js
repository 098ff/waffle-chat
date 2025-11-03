const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function socketAuthMiddleware(socket, next) {
  try {
    const token =
      socket.handshake.auth && socket.handshake.auth.token
        ? socket.handshake.auth.token
        : socket.handshake.query && socket.handshake.query.token
        ? socket.handshake.query.token
        : null;

    if (!token) {
      const err = new Error('Not authorized');
      err.data = { content: 'Missing token' };
      return next(err);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      const err = new Error('Not authorized');
      err.data = { content: 'Invalid token' };
      return next(err);
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      const err = new Error('Not authorized');
      err.data = { content: 'User not found' };
      return next(err);
    }

    // attach user info to socket
    socket.userId = user._id.toString();
    socket.user = user;
    return next();
  } catch (err) {
    console.error('socketAuthMiddleware error', err.message);
    const e = new Error('Not authorized');
    e.data = { content: err.message };
    return next(e);
  }
}

module.exports = {
  socketAuthMiddleware,
};
