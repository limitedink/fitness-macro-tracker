const express = require('express');
const router = express.Router();
const Meal = require('../models/Meal');
const DailyTarget = require('../models/DailyTarget');

// Get all meals for today
router.get('/', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const meals = await Meal.find({
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    res.json(meals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new meal
router.post('/', async (req, res) => {
  try {
    const { name, calories, protein, carbs, fat } = req.body;
    
    // Validate that the macros add up to the calories
    const calculatedCalories = (protein * 4) + (carbs * 4) + (fat * 9);
    if (Math.abs(calculatedCalories - calories) > 1) {
      return res.status(400).json({ message: 'Macros do not add up to the specified calories' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get current daily target
    let dailyTarget = await DailyTarget.findOne({
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (!dailyTarget) {
      return res.status(400).json({ message: 'No daily target set' });
    }

    // Create new meal
    const meal = new Meal({
      name,
      date: today,
      calories,
      protein,
      carbs,
      fat
    });

    // Update daily target progress
    dailyTarget.currentCalories += calories;
    dailyTarget.currentProtein += protein;
    dailyTarget.currentCarbs += carbs;
    dailyTarget.currentFat += fat;

    // If calories are exceeded, adjust macros proportionally
    if (dailyTarget.currentCalories > dailyTarget.calories) {
      const ratio = dailyTarget.calories / dailyTarget.currentCalories;
      dailyTarget.currentProtein = Math.round(dailyTarget.currentProtein * ratio);
      dailyTarget.currentCarbs = Math.round(dailyTarget.currentCarbs * ratio);
      dailyTarget.currentFat = Math.round(dailyTarget.currentFat * ratio);
      dailyTarget.currentCalories = dailyTarget.calories;
    }

    await Promise.all([meal.save(), dailyTarget.save()]);
    res.status(201).json(meal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a meal
router.delete('/:id', async (req, res) => {
  try {
    const meal = await Meal.findByIdAndDelete(req.params.id);
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }
    res.json({ message: 'Meal deleted successfully' });
  } catch (error) {
    console.error('Delete meal error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 