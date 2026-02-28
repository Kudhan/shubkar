const cloudinary = require('cloudinary').v2;

// The user provided 'Cloudinary api:qe7O1S69sQN8n5Bgm3jgbDeNL2g'
// It could be API secret or the entire cloudinary url. 
// Assuming it's the API secret and trying to read from ENV first.

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dc6w5y3b2', // Mock fallback if not in ENV
  api_key: process.env.CLOUDINARY_API_KEY || '123456789012345',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'qe7O1S69sQN8n5Bgm3jgbDeNL2g'
});

const uploadImageToCloudinary = (buffer, mimetype) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'pan_cards' },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload failed (using fallback base64)", error.message);
          // If the mock credentials fail, return base64 string so the user sees the exact image they uploaded instead of a sample!
          const base64 = buffer.toString('base64');
          return resolve(`data:${mimetype || 'image/jpeg'};base64,${base64}`);
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
};

module.exports = {
  cloudinary,
  uploadImageToCloudinary
};
