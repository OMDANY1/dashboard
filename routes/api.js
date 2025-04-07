const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { handleUpload, deleteFile } = require('../utils/fileUpload');

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findOne({ id: req.params.id });
    if (project) {
      res.json(project);
    } else {
      res.status(404).json({ error: 'Project not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create new project
router.post('/create', handleUpload, async (req, res) => {
  try {
    const { title, category, client, rating, description, fullDescription, isFeatured, selectedImagePath } = req.body;
    
    // Generate a URL-friendly ID from the title
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    // Determine the image path
    let imagePath;
    if (req.file) {
      // If a file was uploaded
      imagePath = `/uploads/${req.file.filename}`;
    } else if (selectedImagePath) {
      // If an image was selected from the gallery
      imagePath = selectedImagePath;
    } else {
      // No image provided
      return res.status(400).render('admin/error', {
        title: 'Error',
        message: 'An image is required for the project'
      });
    }
    
    // Create new project
    const project = new Project({
      id,
      title,
      category,
      client,
      rating: parseFloat(rating),
      description,
      fullDescription,
      image: imagePath,
      isFeatured: isFeatured === 'true'
    });
    
    await project.save();
    
    res.redirect('/admin/projects');
  } catch (err) {
    console.error(err);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to create project'
    });
  }
});

// Update project
router.post('/update', handleUpload, async (req, res) => {
  try {
    const { id, title, category, client, rating, description, fullDescription, isFeatured, keepImage, selectedImagePath } = req.body;
    
    // Find the existing project
    const project = await Project.findOne({ id });
    
    if (!project) {
      return res.status(404).render('admin/error', {
        title: 'Error',
        message: 'Project not found'
      });
    }
    
    // Determine the image path
    let imagePath = project.image;
    if (req.file) {
      // If a new file was uploaded
      imagePath = `/uploads/${req.file.filename}`;
      
      // Delete the old image if it's not a default image
      if (project.image && !project.image.includes('project-sample')) {
        deleteFile(project.image);
      }
    } else if (selectedImagePath) {
      // If an image was selected from the gallery
      imagePath = selectedImagePath;
    } else if (keepImage !== 'true') {
      // No image provided and not keeping the old one
      return res.status(400).render('admin/error', {
        title: 'Error',
        message: 'An image is required for the project'
      });
    }
    
    // Update project
    project.title = title;
    project.category = category;
    project.client = client;
    project.rating = parseFloat(rating);
    project.description = description;
    project.fullDescription = fullDescription;
    project.image = imagePath;
    project.isFeatured = isFeatured === 'true';
    project.updatedAt = Date.now();
    
    await project.save();
    
    res.redirect('/admin/projects');
  } catch (err) {
    console.error(err);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to update project'
    });
  }
});

// Delete project
router.post('/delete', async (req, res) => {
  try {
    const { id } = req.body;
    
    // Find the project
    const project = await Project.findOne({ id });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Delete the project image if it's not a default image
    if (project.image && !project.image.includes('project-sample')) {
      deleteFile(project.image);
    }
    
    // Delete the project
    await Project.deleteOne({ id });
    
    res.redirect('/admin/projects');
  } catch (err) {
    console.error(err);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to delete project'
    });
  }
});

module.exports = router;
