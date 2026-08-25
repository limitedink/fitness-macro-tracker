import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
} from '@mui/material';
import axios from 'axios';

const AddMeal = ({ onAdd }) => {
  const [meal, setMeal] = useState({
    name: '',
    protein: '',
    carbs: '',
    fat: '',
  });

  const [calculatedCalories, setCalculatedCalories] = useState(0);

  const calculateCalories = (protein, carbs, fat) => {
    const proteinCalories = Number(protein || 0) * 4;
    const carbsCalories = Number(carbs || 0) * 4;
    const fatCalories = Number(fat || 0) * 9;
    return proteinCalories + carbsCalories + fatCalories;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For meal name, allow any string
    if (name === 'name') {
      setMeal(prev => ({
        ...prev,
        [name]: value
      }));
      return;
    }

    // For numeric fields (protein, carbs, fat)
    if (name === 'protein' || name === 'carbs' || name === 'fat') {
      // Allow empty string
      if (value === '') {
        setMeal(prev => ({
          ...prev,
          [name]: value
        }));
        return;
      }

      // Allow numbers with up to 1 decimal place
      if (/^\d+(\.\d{0,1})?$/.test(value)) {
        setMeal(prev => ({
          ...prev,
          [name]: value
        }));
      }
    }
  };

  useEffect(() => {
    const calories = calculateCalories(meal.protein, meal.carbs, meal.fat);
    setCalculatedCalories(calories);
  }, [meal.protein, meal.carbs, meal.fat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const mealData = {
        name: meal.name,
        calories: calculatedCalories,
        protein: Number(meal.protein),
        carbs: Number(meal.carbs),
        fat: Number(meal.fat)
      };
      
      const response = await axios.post('http://localhost:5001/api/meals', mealData);
      // Add the new meal to the state
      onAdd(response.data);
      // Clear the form
      setMeal({
        name: '',
        protein: '',
        carbs: '',
        fat: '',
      });
      setCalculatedCalories(0);
    } catch (error) {
      console.error('Error adding meal:', error);
      // Show error message to user
      alert(error.response?.data?.message || 'Error adding meal');
    }
  };

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Add Meal
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Meal Name"
                name="name"
                value={meal.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Protein (g)"
                name="protein"
                type="text"
                value={meal.protein}
                onChange={handleChange}
                required
                inputProps={{ 
                  pattern: '^\\d*\\.?\\d{0,1}$',
                  title: 'Enter a number with up to 1 decimal place'
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Carbs (g)"
                name="carbs"
                type="text"
                value={meal.carbs}
                onChange={handleChange}
                required
                inputProps={{ 
                  pattern: '^\\d*\\.?\\d{0,1}$',
                  title: 'Enter a number with up to 1 decimal place'
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Fat (g)"
                name="fat"
                type="text"
                value={meal.fat}
                onChange={handleChange}
                required
                inputProps={{ 
                  pattern: '^\\d*\\.?\\d{0,1}$',
                  title: 'Enter a number with up to 1 decimal place'
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="subtitle1">
                  Calculated Calories: {calculatedCalories.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  (Protein: {(Number(meal.protein || 0) * 4).toFixed(1)} + Carbs: {(Number(meal.carbs || 0) * 4).toFixed(1)} + Fat: {(Number(meal.fat || 0) * 9).toFixed(1)})
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={calculatedCalories === 0}
              >
                Add Meal
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddMeal; 