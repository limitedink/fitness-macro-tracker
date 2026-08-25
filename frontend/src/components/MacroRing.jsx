import { Box, Typography, useTheme } from '@mui/material';
import { MACRO_COLORS } from '../theme';
import { formatAmount, formatKilojoules } from '../lib/macros';

const SIZE = 200;
const STROKE = 16;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Calorie dial. The arc fills to 100% and turns red beyond it, so being over
 * budget reads as a state change rather than a bar that quietly stops moving.
 */
export function MacroRing({ value, target, label = 'cal left' }) {
  const theme = useTheme();
  const ratio = target > 0 ? value / target : 0;
  const over = ratio > 1;
  const left = Math.round((target ?? 0) - value);

  // The headline figure is what is left, or what has been eaten when no target
  // is set. Whichever it is, the kJ line below shows the same figure converted.
  const headline = target > 0 ? Math.abs(left) : value;

  const dash = CIRCUMFERENCE * Math.min(Math.max(ratio, 0), 1);
  const stroke = over ? theme.palette.error.main : 'url(#ringGradient)';

  return (
    <Box sx={{ position: 'relative', width: SIZE, height: SIZE, flexShrink: 0 }}>
      <svg width={SIZE} height={SIZE} role="img" aria-label={`${formatAmount(value)} of ${target} cal`}>
        <defs>
          <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={MACRO_COLORS.calories} />
            <stop offset="100%" stopColor={MACRO_COLORS.protein} />
          </linearGradient>
        </defs>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={theme.palette.divider}
          strokeWidth={STROKE}
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={stroke}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          style={{ transition: 'stroke-dasharray 600ms cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="h3"
          className="tnum"
          sx={{ fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1 }}
          color={over ? 'error.main' : 'text.primary'}
        >
          {target > 0 ? headline : formatAmount(headline)}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {target > 0 ? (over ? 'cal over' : label) : 'cal eaten'}
        </Typography>
        <Typography variant="caption" color="text.secondary" className="tnum">
          {formatKilojoules(headline)}
        </Typography>
        {target > 0 && (
          <Typography
            variant="caption"
            color="text.secondary"
            className="tnum"
            sx={{ opacity: 0.75 }}
          >
            {formatAmount(value)} / {formatAmount(target)} cal
          </Typography>
        )}
      </Box>
    </Box>
  );
}
