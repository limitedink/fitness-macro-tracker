import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
} from '@mui/material';
import axios from 'axios';

const DailyTargets = ({ onUpdate }) => {
  const [targets, setTargets] = useState({
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTargets((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5001/api/daily-targets', targets);
      onUpdate();
      // Clear the form
      setTargets({
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
      });
    } catch (error) {
      console.error('Error setting targets:', error);
    }
  };

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Set Daily Targets
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
                required
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
                required
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
                required
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
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
              >
                Set Targets
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default DailyTargets; 