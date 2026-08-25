import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider, CssBaseline, useMediaQuery } from '@mui/material';
import { createAppTheme } from '../theme';

const STORAGE_KEY = 'macro-tracker:color-mode';
const ColorModeContext = createContext({ mode: 'dark', toggle: () => {} });

export const useColorMode = () => useContext(ColorModeContext);

export function ColorModeProvider({ children }) {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)', { noSsr: true });
  // A stored choice wins; otherwise follow the operating system.
  const [stored, setStored] = useState(() => localStorage.getItem(STORAGE_KEY));
  const mode = stored ?? (prefersDark ? 'dark' : 'light');

  useEffect(() => {
    document.documentElement.style.colorScheme = mode;
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      toggle: () => {
        const next = mode === 'dark' ? 'light' : 'dark';
        localStorage.setItem(STORAGE_KEY, next);
        setStored(next);
      },
    }),
    [mode],
  );

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
