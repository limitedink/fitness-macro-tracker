import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { MacroRing } from './MacroRing';
import { MacroBar } from './MacroBar';
import { MACROS, caloriesFromMacros, formatAmount, formatKilojoules } from '../lib/macros';

export function ProgressCard({ target, inherited, consumed, loading, onEditTarget }) {
  if (loading) {
    return (
      <Card>
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} alignItems="center">
            <Skeleton variant="circular" width={200} height={200} />
            <Stack spacing={3} sx={{ width: '100%' }}>
              {MACROS.map((macro) => (
                <Skeleton key={macro.key} variant="rounded" height={44} />
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  // A target whose calorie goal was typed in by hand can disagree with its own
  // macros. Surface the difference rather than silently overriding either one.
  const macroCalories = target ? Math.round(caloriesFromMacros(target)) : 0;
  const mismatch = target && Math.abs(macroCalories - target.calories) > 5;

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 3 }}
          spacing={1}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6">Progress</Typography>
            {inherited && (
              <Tooltip title="Carried over from your most recent target. Adjust it to set one for this day.">
                <Chip size="small" variant="outlined" label="Inherited goal" />
              </Tooltip>
            )}
          </Stack>

          <Button size="small" startIcon={<TuneIcon />} onClick={onEditTarget}>
            {target ? 'Adjust' : 'Set target'}
          </Button>
        </Stack>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 3, sm: 4 }}
          alignItems="center"
        >
          <MacroRing value={consumed.calories} target={target?.calories ?? 0} />

          <Stack spacing={2.5} sx={{ width: '100%' }}>
            {MACROS.map(({ key, label }) => (
              <MacroBar
                key={key}
                macro={key}
                label={label}
                value={consumed[key]}
                target={target?.[key] ?? 0}
              />
            ))}
          </Stack>
        </Stack>

        {!target && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              No target set yet. Set one and every day after it inherits the same goal.
            </Typography>
          </Box>
        )}

        {mismatch && (
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 3 }}>
            <InfoOutlinedIcon fontSize="small" color="disabled" />
            <Typography variant="caption" color="text.secondary">
              Your macro grams add up to {formatAmount(macroCalories)} cal, but the calorie goal is{' '}
              {formatAmount(target.calories)} cal ({formatKilojoules(target.calories)}).
            </Typography>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
