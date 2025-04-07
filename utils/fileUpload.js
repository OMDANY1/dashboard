const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../public/uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'project-' + uniqueSuffix + ext);
  }
});

// File filter to only allow image files
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Configure multer with storage, limits, and file filter
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Export the upload middleware
module.exports = {
  upload,
  
  // Helper function to handle file uploads
  handleUpload: (req, res, next) => {
    upload.single('image')(req, res, function(err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).render('admin/error', {
            title: 'Error',
            message: 'File size too large. Maximum size is 5MB.'
          });
        }
        return res.status(400).render('admin/error', {
          title: 'Error',
          message: `Upload error: ${err.message}`
        });
      } else if (err) {
        // An unknown error occurred
        return res.status(400).render('admin/error', {
          title: 'Error',
          message: err.message
        });
      }
      // Everything went fine
      next();
    });
  },
  
  // Helper function to delete files
  deleteFile: (filePath) => {
    const fullPath = path.join(__dirname, '../public', filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  }
};
