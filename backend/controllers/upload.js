const cloudinary = require('../config/cloudinary');
const { ErrorMessages } = require('../helper/error');

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({
          message: ErrorMessages.NO_FILE_UPLOADED || 'No file uploaded.',
        });
    }

    const uploadResponse = await cloudinary.uploader.upload(req.file.path);
    return res.status(200).json({
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
    });
  } catch (err) {
    console.error('uploadImage error:', err.message);
    return res.status(500).json({ message: ErrorMessages.SERVER_ERROR });
  }
};

module.exports = { uploadImage };