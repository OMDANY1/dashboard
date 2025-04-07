const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Sample project data
const sampleProjects = [
  {
    id: 'branding-project',
    title: 'Branding Project',
    category: 'Branding',
    client: 'ABC Company',
    rating: 4.8,
    description: 'A complete brand identity redesign for a tech startup.',
    fullDescription: 'This project involved creating a new visual identity, including logo, color palette, typography, and brand guidelines for a growing tech startup. The goal was to create a modern, professional look that would appeal to enterprise clients.',
    image: '/uploads/project-sample-1.jpg',
    isFeatured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'web-design-project',
    title: 'Web Design Project',
    category: 'Web Design',
    client: 'XYZ Corp',
    rating: 4.5,
    description: 'Responsive website design for a financial services company.',
    fullDescription: 'Designed and developed a fully responsive website for a financial services company. The project included user research, wireframing, prototyping, and final implementation. The site features a modern design with a focus on user experience and accessibility.',
    image: '/uploads/project-sample-2.jpg',
    isFeatured: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'mobile-app-ui',
    title: 'Mobile App UI',
    category: 'UI/UX',
    client: 'Health App Inc',
    rating: 4.9,
    description: 'User interface design for a health tracking mobile application.',
    fullDescription: 'Created the user interface and experience design for a health tracking mobile application. The project involved creating user flows, wireframes, and high-fidelity mockups. The final design was implemented in both iOS and Android versions of the app.',
    image: '/uploads/project-sample-3.jpg',
    isFeatured: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create sample images if they don't exist
const createSampleImage = (filename) => {
  const filePath = path.join(uploadsDir, filename);
  if (!fs.existsSync(filePath)) {
    // Create a simple colored rectangle as a sample image
    const canvas = require('canvas');
    const c = canvas.createCanvas(800, 600);
    const ctx = c.getContext('2d');
    
    // Random color
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, 0, 800, 600);
    
    // Add some text
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText('Sample Project Image', 250, 300);
    
    const buffer = c.toBuffer('image/jpeg');
    fs.writeFileSync(filePath, buffer);
  }
};

// Start MongoDB Memory Server
async function startDatabase() {
  try {
    // Start MongoDB Memory Server
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to the in-memory database
    await mongoose.connect(mongoUri);
    console.log('Connected to in-memory MongoDB server');
    
    // Import Project model
    const Project = require('./models/Project');
    
    // Clear existing data
    await Project.deleteMany({});
    
    // Insert sample data
    await Project.insertMany(sampleProjects);
    console.log('Sample projects inserted into database');
    
    // Create sample images
    try {
      createSampleImage('project-sample-1.jpg');
      createSampleImage('project-sample-2.jpg');
      createSampleImage('project-sample-3.jpg');
      console.log('Sample images created');
    } catch (err) {
      console.error('Error creating sample images:', err);
      console.log('Sample images could not be created, but the database is still initialized');
    }
    
    console.log('Database initialized successfully');
    console.log('In-memory MongoDB server running at:', mongoUri);
    console.log('Keep this process running and start the application in another terminal with: npm start');
    
    // Keep the process running
    process.stdin.resume();
    
    // Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.disconnect();
      await mongoServer.stop();
      console.log('Database connection closed');
      process.exit(0);
    });
    
  } catch (err) {
    console.error('Error starting database:', err);
    process.exit(1);
  }
}

startDatabase();
