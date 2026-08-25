import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Box,
  Button,
} from '@mui/material';
import axios from 'axios';

const TargetProgress = ({ targets, meals, onReset }) => {
  // Calculate current totals from meals
  const currentTotals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Round current totals to 1 decimal place
  const roundedTotals = {
    calories: Math.round(currentTotals.calories * 10) / 10,
    protein: Math.round(currentTotals.protein * 10) / 10,
    carbs: Math.round(currentTotals.carbs * 10) / 10,
    fat: Math.round(currentTotals.fat * 10) / 10,
  };

  // Calculate percentages
  const percentages = {
    calories: (roundedTotals.calories / targets.calories) * 100,
    protein: (roundedTotals.protein / targets.protein) * 100,
    carbs: (roundedTotals.carbs / targets.carbs) * 100,
    fat: (roundedTotals.fat / targets.fat) * 100,
  };

  const handleReset = async () => {
    try {
      console.log('Reset button clicked');
      console.log('Making API call to reset progress...');
      const response = await axios.post('http://localhost:5001/api/daily-targets/reset');
      console.log('Reset API response:', response);
      console.log('Calling onReset to refresh data...');
      onReset();
    } catch (error) {
      console.error('Error resetting targets:', error);
    }
  };

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            Daily Progress
          </Typography>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={handleReset}
            disabled={meals.length === 0}
          >
            Reset Progress
          </Button>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Calories: {roundedTotals.calories}/{targets.calories}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(percentages.calories, 100)}
                color={percentages.calories > 100 ? 'error' : 'primary'}
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Protein: {roundedTotals.protein}g/{targets.protein}g
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(percentages.protein, 100)}
                color={percentages.protein > 100 ? 'error' : 'primary'}
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Carbs: {roundedTotals.carbs}g/{targets.carbs}g
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(percentages.carbs, 100)}
                color={percentages.carbs > 100 ? 'error' : 'primary'}
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Fat: {roundedTotals.fat}g/{targets.fat}g
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(percentages.fat, 100)}
                color={percentages.fat > 100 ? 'error' : 'primary'}
              />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default TargetProgress; 