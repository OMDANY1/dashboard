const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const dotenv = require('dotenv');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// Set up MongoDB connection - will use environment variable in production
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio-admin';

// Connect to MongoDB with retry logic
const connectDB = async () => {
  try {
    // Use in-memory MongoDB for development if no connection string is provided
    if (!process.env.MONGODB_URI) {
      console.log('No MongoDB URI provided, using in-memory database');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log('Connected to in-memory MongoDB instance');
    } else {
      await mongoose.connect(MONGODB_URI);
      console.log('Connected to MongoDB');
    }
  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Middleware
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Basic authentication middleware for admin routes
const authenticate = (req, res, next) => {
  const auth = { 
    login: process.env.ADMIN_USER || 'admin', 
    password: process.env.ADMIN_PASSWORD || 'password' 
  };
  
  // Parse login and password from headers
  const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
  const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');
  
  // Verify login and password
  if (login && password && login === auth.login && password === auth.password) {
    return next();
  }
  
  // Access denied
  res.set('WWW-Authenticate', 'Basic realm="Admin Dashboard"');
  res.status(401).send('Authentication required');
};

// Import routes
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');
const uploadRoutes = require('./routes/uploads');

// Use routes
app.use('/admin', authenticate, adminRoutes);
app.use('/api/projects', apiRoutes);
app.use('/api/uploads', uploadRoutes);

// Add route for image gallery
app.get('/admin/gallery', authenticate, (req, res) => {
  res.render('admin/gallery', { title: 'Image Gallery' });
});

// Portfolio routes (simplified for this fixed version)
app.get('/', (req, res) => {
  res.redirect('/admin');
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).render('admin/error', { 
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('admin/error', {
    title: 'Server Error',
    message: 'Something went wrong on the server.'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
