const express = require('express');
const {register, login, logout, getMe} = require('../controllers/auth');
const {protect} = require('../middleware/auth');
const upload = require('../config/multer');

const router = express.Router();

router.post('/register', upload.single('profilePic'), register);
router.post('/login', login);
router.post("/logout", logout);

router.get("/check", protect, (req, res) => res.status(200).json(req.user));
router.get("/me", protect, getMe);

module.exports = router;