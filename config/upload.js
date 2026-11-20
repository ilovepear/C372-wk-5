const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const directory = path.join(__dirname, '..', 'public', 'images');
fs.mkdirSync(directory, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, directory),
  filename: (_req, file, callback) => {
    const ext = ({ 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' })[file.mimetype];
    callback(null, 'upload-' + crypto.randomUUID() + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
    callback(ok ? null : new Error('Upload a JPG, PNG or WebP image.'), ok);
  }
});
module.exports = upload;
