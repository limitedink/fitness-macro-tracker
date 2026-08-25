const mongoose = require('mongoose');

const dailyTargetSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  calories: {
    type: Number,
    required: true
  },
  protein: {
    type: Number,
    required: true
  },
  carbs: {
    type: Number,
    required: true
  },
  fat: {
    type: Number,
    required: true
  },
  currentCalories: {
    type: Number,
    default: 0
  },
  currentProtein: {
    type: Number,
    default: 0
  },
  currentCarbs: {
    type: Number,
    default: 0
  },
  currentFat: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('DailyTarget', dailyTargetSchema); 