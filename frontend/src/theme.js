import { createTheme, alpha } from '@mui/material/styles';

/** One colour per nutrient, reused by every ring, bar and chip in the app. */
export const MACRO_COLORS = Object.freeze({
  calories: '#14b8a6',
  protein: '#6366f1',
  carbs: '#f59e0b',
  fat: '#f43f5e',
});

const dark = {
  background: { default: '#0b0d12', paper: '#12151d' },
  divider: 'rgba(255,255,255,0.08)',
  text: { primary: '#e8eaf0', secondary: '#9aa3b2' },
};

const light = {
  background: { default: '#f6f7f9', paper: '#ffffff' },
  divider: 'rgba(15,23,42,0.08)',
  text: { primary: '#0f172a', secondary: '#5b6472' },
};

export function createAppTheme(mode) {
  const scheme = mode === 'dark' ? dark : light;

  return createTheme({
    palette: {
      mode,
      primary: { main: MACRO_COLORS.calories, contrastText: '#04120f' },
      secondary: { main: MACRO_COLORS.protein },
      error: { main: MACRO_COLORS.fat },
      warning: { main: MACRO_COLORS.carbs },
      ...scheme,
    },
    shape: { borderRadius: 16 },
    typography: {
      fontFamily: "'Inter Variable', system-ui, -apple-system, 'Segoe UI', sans-serif",
      h1: { fontWeight: 700, letterSpacing: '-0.03em' },
      h5: { fontWeight: 650, letterSpacing: '-0.02em' },
      h6: { fontWeight: 650, letterSpacing: '-0.01em' },
      subtitle2: { fontWeight: 600, letterSpacing: '0.02em' },
      button: { fontWeight: 600, textTransform: 'none' },
      // Numbers line up in columns when they share a width.
      overline: { fontWeight: 700, letterSpacing: '0.12em' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundImage:
              mode === 'dark'
                ? 'radial-gradient(1000px 600px at 12% -10%, rgba(20,184,166,0.10), transparent 60%),' +
                  'radial-gradient(900px 500px at 90% 0%, rgba(99,102,241,0.10), transparent 55%)'
                : 'radial-gradient(1000px 600px at 12% -10%, rgba(20,184,166,0.12), transparent 60%),' +
                  'radial-gradient(900px 500px at 90% 0%, rgba(99,102,241,0.10), transparent 55%)',
            backgroundAttachment: 'fixed',
          },
          // Tabular figures keep totals from jittering as they update.
          '.tnum': { fontVariantNumeric: 'tabular-nums' },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: 'none',
            border: `1px solid ${theme.palette.divider}`,
          }),
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: alpha(theme.palette.background.paper, mode === 'dark' ? 0.7 : 0.85),
            backdropFilter: 'blur(12px)',
          }),
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { borderRadius: 12, paddingInline: 18 } },
      },
      MuiTextField: { defaultProps: { size: 'small' } },
      MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 12 } } },
      MuiChip: { styleOverrides: { root: { fontWeight: 600, borderRadius: 8 } } },
      MuiTooltip: { defaultProps: { arrow: true } },
    },
  });
}
