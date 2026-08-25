import { Box, LinearProgress, Stack, Typography, alpha } from '@mui/material';
import { MACRO_COLORS } from '../theme';
import { formatAmount, percentOf } from '../lib/macros';

/** One nutrient's progress: grams eaten against grams targeted. */
export function MacroBar({ macro, label, value, target }) {
  const color = MACRO_COLORS[macro];
  const percent = percentOf(value, target);
  const over = percent > 100;

  return (
    <Box sx={{ width: '100%' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.75 }}>
        <Typography variant="subtitle2" sx={{ color }}>
          {label}
        </Typography>
        <Typography variant="body2" className="tnum" color="text.secondary">
          <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
            {formatAmount(value)}
          </Box>
          {target > 0 ? ` / ${formatAmount(target)} g` : ' g'}
        </Typography>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={Math.min(Math.max(percent, 0), 100)}
        aria-label={`${label} progress`}
        sx={{
          height: 8,
          borderRadius: 99,
          backgroundColor: alpha(color, 0.15),
          '& .MuiLinearProgress-bar': {
            borderRadius: 99,
            backgroundColor: over ? 'error.main' : color,
            transition: 'transform 500ms cubic-bezier(0.4, 0, 0.2, 1)',
          },
        }}
      />

      {target > 0 && (
        <Typography
          variant="caption"
          className="tnum"
          color={over ? 'error.main' : 'text.secondary'}
          sx={{ display: 'block', mt: 0.5 }}
        >
          {over
            ? `${formatAmount(value - target)} g over`
            : `${formatAmount(target - value)} g left`}
        </Typography>
      )}
    </Box>
  );
}
