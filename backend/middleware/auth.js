const jwt = require('jsonwebtoken');
const User = require('../models/User');

// This function will check that the requesting user ar accessable or not
exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        // Get a token by splt to remove Bearer then get the token only
        token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorize to access this route'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log(decoded);

        req.user = await User.findById(decoded.id);

        next();
    } catch (err) {
        console.log(err.stack);
        return res.status(401).json({
            success: false,
            message: 'Not authorize to access this route'
        });
    }
};