const express = require('express');
const router = express.Router();
const DailyTarget = require('../models/DailyTarget');
const Meal = require('../models/Meal');

// Get current daily target
router.get('/', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let dailyTarget = await DailyTarget.findOne({
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (!dailyTarget) {
      dailyTarget = new DailyTarget({
        date: today,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      });
      await dailyTarget.save();
    }

    res.json(dailyTarget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Set daily target
router.post('/', async (req, res) => {
  try {
    const { calories, protein, carbs, fat } = req.body;
    
    // Validate that the macros add up to the calories
    const calculatedCalories = (protein * 4) + (carbs * 4) + (fat * 9);
    if (Math.abs(calculatedCalories - calories) > 1) {
      return res.status(400).json({ message: 'Macros do not add up to the specified calories' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let dailyTarget = await DailyTarget.findOne({
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (dailyTarget) {
      dailyTarget.calories = calories;
      dailyTarget.protein = protein;
      dailyTarget.carbs = carbs;
      dailyTarget.fat = fat;
      dailyTarget.currentCalories = 0;
      dailyTarget.currentProtein = 0;
      dailyTarget.currentCarbs = 0;
      dailyTarget.currentFat = 0;
    } else {
      dailyTarget = new DailyTarget({
        date: today,
        calories,
        protein,
        carbs,
        fat
      });
    }

    await dailyTarget.save();
    res.json(dailyTarget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reset daily progress
router.post('/reset', async (req, res) => {
  try {
    console.log('Reset endpoint called');
    
    // Delete all meals
    const deleteResult = await Meal.deleteMany({});
    console.log('Delete result:', deleteResult);

    // Verify no meals exist
    const remainingMeals = await Meal.find({});
    console.log('Remaining meals:', remainingMeals);

    if (remainingMeals.length > 0) {
      console.log('Found remaining meals, trying to delete again');
      // Try to delete again with a different approach
      await Meal.deleteMany({}).exec();
      const checkAgain = await Meal.find({});
      console.log('Meals after second delete:', checkAgain);
    }

    // Reset daily target progress
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dailyTarget = await DailyTarget.findOne({
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    if (dailyTarget) {
      dailyTarget.currentCalories = 0;
      dailyTarget.currentProtein = 0;
      dailyTarget.currentCarbs = 0;
      dailyTarget.currentFat = 0;
      await dailyTarget.save();
    }

    res.json({ message: 'Progress reset successfully' });
  } catch (error) {
    console.error('Reset progress error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 