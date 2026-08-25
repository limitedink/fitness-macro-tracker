import {
  AppBar,
  Box,
  Button,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DarkModeIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeIcon from '@mui/icons-material/LightModeOutlined';
import { useColorMode } from '../context/ColorModeContext';
import { DataMenu } from './DataMenu';
import { DATA_MODE } from '../lib/api';
import { formatDayLabel, isToday, isFuture, shiftDay, toDayKey } from '../lib/day';

export function AppHeader({ day, onDayChange, onImported }) {
  const { mode, toggle } = useColorMode();
  const atToday = isToday(day);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="transparent"
      sx={{
        backdropFilter: 'blur(16px)',
        backgroundColor: (theme) => alpha(theme.palette.background.default, 0.72),
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar sx={{ gap: 1, maxWidth: 'lg', width: '100%', mx: 'auto' }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            letterSpacing: '-0.02em',
            mr: 'auto',
            background: 'linear-gradient(120deg, #14b8a6, #6366f1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Macro Tracker
        </Typography>

        <Stack direction="row" alignItems="center" spacing={0.5}>
          <IconButton
            size="small"
            onClick={() => onDayChange(shiftDay(day, -1))}
            aria-label="Previous day"
          >
            <ChevronLeftIcon />
          </IconButton>

          <Box sx={{ minWidth: { xs: 84, sm: 116 }, textAlign: 'center' }}>
            <Typography variant="subtitle2" noWrap>
              {formatDayLabel(day)}
            </Typography>
          </Box>

          <Tooltip title={isFuture(shiftDay(day, 1)) ? 'No future days' : ''}>
            <span>
              <IconButton
                size="small"
                onClick={() => onDayChange(shiftDay(day, 1))}
                disabled={isFuture(shiftDay(day, 1))}
                aria-label="Next day"
              >
                <ChevronRightIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        {!atToday && (
          <Button size="small" onClick={() => onDayChange(toDayKey())}>
            Today
          </Button>
        )}

        <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
          <IconButton onClick={toggle} size="small" aria-label="Toggle colour mode">
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>

        {DATA_MODE === 'local' && <DataMenu onImported={onImported} />}
      </Toolbar>
    </AppBar>
  );
}
