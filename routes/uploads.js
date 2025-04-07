const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { upload } = require('../utils/fileUpload');

// Upload image
router.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const imagePath = `/uploads/${req.file.filename}`;
    res.json({ success: true, path: imagePath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// List all images
router.get('/list', (req, res) => {
  try {
    const uploadsDir = path.join(__dirname, '../public/uploads');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      return res.json({ images: [] });
    }
    
    // Read all files in the uploads directory
    const files = fs.readdirSync(uploadsDir);
    
    // Filter for image files
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
    });
    
    // Create image objects with path and name
    const images = imageFiles.map(file => ({
      name: file,
      path: `/uploads/${file}`
    }));
    
    res.json({ images });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list images' });
  }
});

// Delete image
router.post('/delete', (req, res) => {
  try {
    const { path: imagePath } = req.body;
    
    if (!imagePath) {
      return res.status(400).json({ error: 'No image path provided' });
    }
    
    const fullPath = path.join(__dirname, '../public', imagePath);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    // Delete the file
    fs.unlinkSync(fullPath);
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

module.exports = router;
