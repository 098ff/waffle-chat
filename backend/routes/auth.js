const express = require('express');
const {register, login, logout} = require('../controllers/auth');
const {protect} = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post("/logout", logout);

router.get("/check", protect, (req, res) => res.status(200).json(req.user));

module.exports = router;