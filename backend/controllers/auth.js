const User = require('../models/User');

const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken(); 

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000), 
        httpOnly: true
    };

    // If in 'produnction' mode
    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }
    res.status(statusCode)
       .json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        token
    });
};

const register = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        // Create user
        const user = await User.create({
            fullName,
            email,
            password,
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
                msg: 'Please provide an email and password'
            });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({
                success: false,
                msg: 'Invalid credentials'
            });
        }

        //Check if password is matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                msg: 'Invalid credentials'
            });
        }

        sendTokenResponse(user, 200, res);

    } catch (error) {
        console.error("Error in login controller:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const logout = (req, res) => {
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0), 
      // secure: process.env.NODE_ENV === 'production',
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout controller:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
    register,
    login,
    logout
};