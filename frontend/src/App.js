import React, { useState, useEffect } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { getDailyTargets, getMeals, resetProgress, deleteMeal } from './api';
import DailyTargets from './components/DailyTargets';
import AddMeal from './components/AddMeal';
import MealList from './components/MealList';
import TargetProgress from './components/TargetProgress';

function App() {
  const [targets, setTargets] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [meals, setMeals] = useState([]);

  const fetchTargets = async () => {
    try {
      const response = await getDailyTargets();
      if (response.data) {
        setTargets(response.data);
      }
    } catch (error) {
      console.error('Error fetching targets:', error);
    }
  };

  const fetchMeals = async () => {
    try {
      const response = await getMeals();
      setMeals(response.data);
    } catch (error) {
      console.error('Error fetching meals:', error);
    }
  };

  const handleReset = async () => {
    try {
      await resetProgress();
      setMeals([]);
      setTargets(prev => ({
        ...prev,
        currentCalories: 0,
        currentProtein: 0,
        currentCarbs: 0,
        currentFat: 0
      }));
      await fetchTargets();
    } catch (error) {
      console.error('Error resetting progress:', error);
      alert('Error resetting progress. Please try again.');
    }
  };

  const handleAddMeal = (newMeal) => {
    setMeals(prev => [...prev, newMeal]);
  };

  const handleDeleteMeal = async (mealId) => {
    try {
      await deleteMeal(mealId);
      setMeals(prev => prev.filter(meal => meal._id !== mealId));
    } catch (error) {
      console.error('Error deleting meal:', error);
      alert(error.response?.data?.message || 'Error deleting meal');
    }
  };

  useEffect(() => {
    fetchTargets();
    fetchMeals();
  }, []);

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Fitness Macro Tracker
        </Typography>
        
        <DailyTargets onUpdate={fetchTargets} />
        <TargetProgress targets={targets} meals={meals} onReset={handleReset} />
        <AddMeal onAdd={handleAddMeal} />
        <MealList meals={meals} onDelete={handleDeleteMeal} />
      </Box>
    </Container>
  );
}

export default App;
