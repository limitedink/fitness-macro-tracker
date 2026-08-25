import { useCallback, useState } from 'react';
import { Alert, Box, Container, Stack, Typography } from '@mui/material';
import { AppHeader } from './components/AppHeader';
import { ProgressCard } from './components/ProgressCard';
import { AddMealCard } from './components/AddMealCard';
import { MealsCard } from './components/MealsCard';
import { TargetDialog } from './components/TargetDialog';
import { useDaySummary } from './hooks/useDaySummary';
import { useToast } from './context/ToastContext';
import { api } from './lib/api';
import { toDayKey } from './lib/day';

export default function App() {
  const [day, setDay] = useState(() => toDayKey());
  const [targetOpen, setTargetOpen] = useState(false);
  const summary = useDaySummary(day);
  const toast = useToast();

  const { refresh } = summary;

  const handleDelete = useCallback(
    async (meal) => {
      try {
        await api.deleteMeal(meal._id ?? meal.id);
        await refresh();
        toast(`Deleted ${meal.name}`);
      } catch (err) {
        toast(err.message, 'error');
      }
    },
    [refresh, toast],
  );

  const handleClearDay = useCallback(async () => {
    try {
      const { deleted } = await api.clearDay(day);
      await refresh();
      toast(`Cleared ${deleted} meal${deleted === 1 ? '' : 's'}`);
    } catch (err) {
      toast(err.message, 'error');
    }
  }, [day, refresh, toast]);

  return (
    <Box sx={{ minHeight: '100dvh' }}>
      <AppHeader day={day} onDayChange={setDay} onImported={refresh} />

      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 5 } }}>
        {summary.error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => refresh()}>
            {summary.error.message}
          </Alert>
        )}

        <Stack spacing={{ xs: 2.5, sm: 3 }}>
          <ProgressCard
            target={summary.target}
            inherited={summary.inherited}
            consumed={summary.consumed}
            loading={summary.loading}
            onEditTarget={() => setTargetOpen(true)}
          />

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 2.5, sm: 3 }} alignItems="flex-start">
            <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
              <AddMealCard day={day} onAdded={refresh} />
            </Box>
            <Box sx={{ flex: 1.2, minWidth: 0, width: '100%' }}>
              <MealsCard
                meals={summary.meals}
                loading={summary.loading}
                onDelete={handleDelete}
                onClearDay={handleClearDay}
              />
            </Box>
          </Stack>
        </Stack>

        <Typography
          variant="caption"
          color="text.secondary"
          align="center"
          sx={{ display: 'block', mt: 6 }}
        >
          Calories are derived from macros using 4 cal/g protein, 4 cal/g carbs, 9 cal/g fat.
          1 cal = 4.184 kJ.
        </Typography>
      </Container>

      <TargetDialog
        open={targetOpen}
        day={day}
        target={summary.target}
        onClose={() => setTargetOpen(false)}
        onSaved={refresh}
      />
    </Box>
  );
}
