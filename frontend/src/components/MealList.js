import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const MealList = ({ meals, onDelete }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [mealToDelete, setMealToDelete] = React.useState(null);

  const handleDeleteClick = (meal) => {
    setMealToDelete(meal);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await onDelete(mealToDelete._id);
      setDeleteDialogOpen(false);
      setMealToDelete(null);
    } catch (error) {
      console.error('Error deleting meal:', error);
      alert(error.response?.data?.message || 'Error deleting meal');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setMealToDelete(null);
  };

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Meals
        </Typography>
        
        <List>
          {meals.map((meal) => (
            <ListItem
              key={meal._id}
              secondaryAction={
                <IconButton 
                  edge="end" 
                  onClick={() => handleDeleteClick(meal)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={meal.name}
                secondary={
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        Calories: {Math.round(meal.calories * 10) / 10}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        Protein: {Math.round(meal.protein * 10) / 10}g
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        Carbs: {Math.round(meal.carbs * 10) / 10}g
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2">
                        Fat: {Math.round(meal.fat * 10) / 10}g
                      </Typography>
                    </Grid>
                  </Grid>
                }
              />
            </ListItem>
          ))}
        </List>

        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
        >
          <DialogTitle>Delete Meal</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{mealToDelete?.name}"?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default MealList; 