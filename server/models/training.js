const mongoose = require('mongoose');

const Series  = mongoose.Schema({
  order: {
    type: Number,
    required: true,
  },
  repetition: {
    type: Number,
    required: true,
  },
  load: {
    type: Number,
    required: true,
  }
});

const Exercise = mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  order: {
    type: Number,
    required: true,
  },
  series: [ Series ]
});

const Training = mongoose.model('Training', {
  date: {
    type: Number,
    required: true
  },
  exercises: [ Exercise ],
  duration: {
    type: Number
  }
});

module.exports = { Training };
