const express = require('express');
const multer = require('multer');
const { uploadImage } = require('../controllers/upload');
const { protect } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // temp folder

router.post('/image', protect, upload.single('image'), uploadImage);

module.exports = router;
