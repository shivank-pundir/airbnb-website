const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// For localhost development, use default values if environment variables are not set
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME || 'your_cloud_name',
    api_key: process.env.CLOUD_API_KEY || 'your_api_key',
    api_secret: process.env.CLOUD_SECRET || 'your_api_secret'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'wonderlust_DEV',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  }
});

module.exports = {
    cloudinary,
    storage,
};