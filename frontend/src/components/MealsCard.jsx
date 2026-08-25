import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RestaurantIcon from '@mui/icons-material/RestaurantOutlined';
import { MACRO_COLORS } from '../theme';
import { MACROS, formatAmount, formatKilojoules } from '../lib/macros';
import { formatTime } from '../lib/day';

function MacroChip({ macro, value }) {
  return (
    <Chip
      size="small"
      label={`${formatAmount(value)}g ${macro}`}
      sx={{
        bgcolor: alpha(MACRO_COLORS[macro], 0.14),
        color: MACRO_COLORS[macro],
        border: 'none',
      }}
    />
  );
}

function EmptyState() {
  return (
    <Stack alignItems="center" spacing={1.5} sx={{ py: 6, textAlign: 'center' }}>
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
          color: 'primary.main',
        }}
      >
        <RestaurantIcon />
      </Box>
      <Typography variant="subtitle1">Nothing logged yet</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320 }}>
        Add your first meal above and it will show up here with its macro breakdown.
      </Typography>
    </Stack>
  );
}

export function MealsCard({ meals, loading, onDelete, onClearDay }) {
  const [pendingDelete, setPendingDelete] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const confirmDelete = async () => {
    const meal = pendingDelete;
    setPendingDelete(null);
    await onDelete(meal);
  };

  const clearDay = async () => {
    setConfirmClear(false);
    await onClearDay();
  };

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6">Meals</Typography>
            {meals.length > 0 && <Chip size="small" label={meals.length} variant="outlined" />}
          </Stack>

          {meals.length > 0 && (
            <Button size="small" color="error" onClick={() => setConfirmClear(true)}>
              Clear day
            </Button>
          )}
        </Stack>

        {loading ? (
          <Stack spacing={1.5} sx={{ mt: 2 }}>
            {[0, 1, 2].map((row) => (
              <Skeleton key={row} variant="rounded" height={64} />
            ))}
          </Stack>
        ) : meals.length === 0 ? (
          <EmptyState />
        ) : (
          <Stack divider={<Divider flexItem />}>
            {meals.map((meal) => (
              <Stack
                key={meal._id ?? meal.id}
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{
                  py: 1.75,
                  '&:hover .meal-delete': { opacity: 1 },
                }}
              >
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mb: 0.75 }}>
                    <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
                      {meal.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                      {formatTime(meal.eatenAt)}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                    {MACROS.map(({ key }) => (
                      <MacroChip key={key} macro={key} value={meal[key]} />
                    ))}
                  </Stack>
                </Box>

                <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                  <Typography variant="subtitle1" className="tnum" sx={{ fontWeight: 700 }}>
                    {formatAmount(meal.calories)}
                    <Typography component="span" variant="caption" color="text.secondary">
                      {' '}
                      cal
                    </Typography>
                  </Typography>
                  <Typography variant="caption" color="text.secondary" className="tnum">
                    {formatKilojoules(meal.calories)}
                  </Typography>
                </Box>

                <Tooltip title="Delete meal">
                  <IconButton
                    className="meal-delete"
                    onClick={() => setPendingDelete(meal)}
                    aria-label={`Delete ${meal.name}`}
                    size="small"
                    sx={{
                      opacity: { xs: 1, md: 0.35 },
                      transition: 'opacity 150ms',
                      '&:hover': { color: 'error.main' },
                    }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            ))}
          </Stack>
        )}
      </CardContent>

      <Dialog open={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)}>
        <DialogTitle>Delete this meal?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            “{pendingDelete?.name}” will be removed and your totals will update.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingDelete(null)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmClear} onClose={() => setConfirmClear(false)}>
        <DialogTitle>Clear this day?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            All {meals.length} meal{meals.length === 1 ? '' : 's'} logged for this day will be
            deleted. Other days are not affected, and your target stays as it is.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmClear(false)}>Cancel</Button>
          <Button onClick={clearDay} color="error" variant="contained">
            Clear day
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
