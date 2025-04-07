const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { upload } = require('../utils/fileUpload');

// Admin dashboard
router.get('/', async (req, res) => {
  try {
    // Get dashboard stats
    const projectCount = await Project.countDocuments();
    const featuredCount = await Project.countDocuments({ isFeatured: true });
    const recentProjects = await Project.find().sort({ createdAt: -1 }).limit(5);
    
    // Mock image count for now
    const imageCount = 12;
    
    res.render('admin/dashboard', {
      title: 'Dashboard',
      stats: {
        projectCount,
        featuredCount,
        imageCount
      },
      recentProjects
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load dashboard data'
    });
  }
});

// Projects list
router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.render('admin/projects', {
      title: 'Projects',
      projects
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load projects'
    });
  }
});

// New project form
router.get('/projects/new', (req, res) => {
  res.render('admin/project-form', {
    title: 'Project Form',
    isNew: true,
    project: {
      id: '',
      title: '',
      category: '',
      client: '',
      rating: 4.5,
      description: '',
      fullDescription: '',
      image: '',
      isFeatured: false
    }
  });
});

// Edit project form
router.get('/projects/edit/:id', async (req, res) => {
  try {
    const project = await Project.findOne({ id: req.params.id });
    if (project) {
      res.render('admin/project-form', {
        title: 'Project Form',
        isNew: false,
        project
      });
    } else {
      res.status(404).render('admin/error', {
        title: 'Error',
        message: 'Project not found'
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).render('admin/error', {
      title: 'Error',
      message: 'Failed to load project'
    });
  }
});

module.exports = router;
