import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  LinearProgress,
} from '@mui/material';
import axios from 'axios';

function DailyTarget({ dailyTarget, onUpdate }) {
  const [targets, setTargets] = useState({
    calories: dailyTarget?.calories || 0,
    protein: dailyTarget?.protein || 0,
    carbs: dailyTarget?.carbs || 0,
    fat: dailyTarget?.fat || 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTargets(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5001/api/daily-targets', targets);
      onUpdate();
    } catch (error) {
      console.error('Error setting daily target:', error);
    }
  };

  const handleReset = async () => {
    try {
      await axios.post('http://localhost:5001/api/daily-targets/reset');
      onUpdate();
    } catch (error) {
      console.error('Error resetting daily target:', error);
    }
  };

  const calculateProgress = (current, target) => {
    if (!target) return 0;
    return Math.min((current / target) * 100, 100);
  };

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Daily Targets
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Calories"
                name="calories"
                type="number"
                value={targets.calories}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Protein (g)"
                name="protein"
                type="number"
                value={targets.protein}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Carbs (g)"
                name="carbs"
                type="number"
                value={targets.carbs}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fat (g)"
                name="fat"
                type="number"
                value={targets.fat}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                fullWidth
              >
                Set Targets
              </Button>
            </Grid>
          </Grid>
        </form>

        {dailyTarget && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Current Progress
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Calories: {dailyTarget.currentCalories} / {dailyTarget.calories}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={calculateProgress(dailyTarget.currentCalories, dailyTarget.calories)}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Protein: {dailyTarget.currentProtein}g / {dailyTarget.protein}g
              </Typography>
              <LinearProgress
                variant="determinate"
                value={calculateProgress(dailyTarget.currentProtein, dailyTarget.protein)}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Carbs: {dailyTarget.currentCarbs}g / {dailyTarget.carbs}g
              </Typography>
              <LinearProgress
                variant="determinate"
                value={calculateProgress(dailyTarget.currentCarbs, dailyTarget.carbs)}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Fat: {dailyTarget.currentFat}g / {dailyTarget.fat}g
              </Typography>
              <LinearProgress
                variant="determinate"
                value={calculateProgress(dailyTarget.currentFat, dailyTarget.fat)}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>

            <Button
              variant="outlined"
              color="secondary"
              onClick={handleReset}
              fullWidth
            >
              Reset Progress
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default DailyTarget; 