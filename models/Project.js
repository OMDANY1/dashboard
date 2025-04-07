const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  client: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  description: {
    type: String,
    required: true
  },
  fullDescription: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Project', projectSchema);
