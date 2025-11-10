const User = require('../models/User');
const { ErrorMessages } = require('../helper/error.js');
const cloudinary = require('../config/cloudinary');

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  // If in 'produnction' mode
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }
  res.status(statusCode).json({
    success: true,
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    profilePic: user.profilePic,
    token,
  });
};

const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingEmail = await User.findOne({ email: email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'This email is already registered.',
      });
    }

    const existingUser = await User.findOne({ fullName: fullName });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'This username is already registered.',
      });
    }

    let profilePicUrl = '';

    // Handle profile picture upload if provided
    if (req.file) {
      try {
        // Convert buffer to base64
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'waffle-chat/profile-pictures',
          resource_type: 'auto',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto' },
          ],
        });

        profilePicUrl = result.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(400).json({
          success: false,
          message: 'Failed to upload profile picture. Please try again.',
        });
      }
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      password,
      profilePic: profilePicUrl,
    });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
    console.log(err.stack);
  }
};

const login = async (req, res) => {
  try {
    // Validate email & password
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        msg: ErrorMessages.EMAIL_PASSWORD_REQUIRED,
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({
        success: false,
        msg: ErrorMessages.INVALID_CREDENTIALS,
      });
    }

    //Check if password is matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        msg: ErrorMessages.INVALID_CREDENTIALS,
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Error in login controller:', error);
    res
      .status(500)
      .json({ success: false, message: ErrorMessages.INTERNAL_SERVER_ERROR });
  }
};

const logout = (req, res) => {
  try {
    res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0),
      // secure: process.env.NODE_ENV === 'production',
    });

    res
      .status(200)
      .json({ success: true, message: ErrorMessages.LOGGED_OUT_SUCCESS });
  } catch (error) {
    console.error('Error in logout controller:', error);
    res
      .status(500)
      .json({ success: false, message: ErrorMessages.INTERNAL_SERVER_ERROR });
  }
};

// Get current logged-in user
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    console.log(user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error('Error in getMe:', err.message);
    res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred',
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
};
