import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  InputAdornment,
  Slider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  BODYWEIGHT_RATIOS,
  MACROS,
  WEIGHT_LIMITS,
  caloriesFromMacros,
  formatAmount,
  formatKilojoules,
  macrosFromWeight,
  ratioRange,
  toNumber,
} from '../lib/macros';
import { MACRO_COLORS } from '../theme';

const STORAGE_KEY = 'macro-tracker:bodyweight';

const defaultRatios = () =>
  Object.fromEntries(MACROS.map(({ key }) => [key, BODYWEIGHT_RATIOS[key].default]));

/** Remembers the last weight and ratios, so this is a one-tap recalculation later. */
function loadSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (!saved) return { weight: '', ratios: defaultRatios() };
    return { weight: saved.weight ?? '', ratios: { ...defaultRatios(), ...saved.ratios } };
  } catch {
    return { weight: '', ratios: defaultRatios() };
  }
}

/**
 * Derives macro grams from bodyweight, the way targets are normally prescribed:
 * so many grams per kilogram. Applying the result fills in the gram fields
 * above, which stay editable -- this is a starting point, not a lock.
 */
export function BodyweightCalculator({ onApply }) {
  const [{ weight, ratios }, setState] = useState(loadSaved);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ weight, ratios }));
  }, [weight, ratios]);

  const kg = toNumber(weight);
  const valid = kg >= WEIGHT_LIMITS.min && kg <= WEIGHT_LIMITS.max;
  const grams = macrosFromWeight(kg, ratios);
  const calories = caloriesFromMacros(grams);

  const setRatio = (key) => (event, value) =>
    setState((prev) => ({ ...prev, ratios: { ...prev.ratios, [key]: value } }));

  return (
    <Stack spacing={2.5}>
      <TextField
        label="Bodyweight"
        value={weight}
        onChange={(event) => setState((prev) => ({ ...prev, weight: event.target.value }))}
        type="number"
        inputProps={{ min: WEIGHT_LIMITS.min, max: WEIGHT_LIMITS.max, step: 0.5, inputMode: 'decimal' }}
        InputProps={{ endAdornment: <InputAdornment position="end">kg</InputAdornment> }}
        error={weight !== '' && !valid}
        helperText={
          weight !== '' && !valid
            ? `Enter a weight between ${WEIGHT_LIMITS.min} and ${WEIGHT_LIMITS.max} kg`
            : ' '
        }
        fullWidth
      />

      <Stack spacing={2} sx={{ opacity: valid ? 1 : 0.45, transition: 'opacity 200ms' }}>
        {MACROS.map(({ key, label }) => {
          const config = BODYWEIGHT_RATIOS[key];
          const range = ratioRange(kg, key);

          return (
            <Box key={key}>
              <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                <Typography variant="subtitle2" sx={{ color: MACRO_COLORS[key] }}>
                  {label}
                </Typography>
                <Typography variant="body2" className="tnum" color="text.secondary">
                  {ratios[key]} g/kg →{' '}
                  <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
                    {valid ? `${grams[key]} g` : '—'}
                  </Box>
                </Typography>
              </Stack>

              <Slider
                value={ratios[key]}
                onChange={setRatio(key)}
                min={config.min}
                max={config.max}
                step={config.step}
                disabled={!valid}
                aria-label={`${label} grams per kilogram`}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value} g/kg`}
                sx={{
                  color: MACRO_COLORS[key],
                  py: 1.25,
                  '& .MuiSlider-thumb': { width: 16, height: 16 },
                }}
              />

              <Typography variant="caption" color="text.secondary" className="tnum">
                {config.min}–{config.max} g/kg
                {valid && ` · ${range.min}–${range.max} g at ${formatAmount(kg)} kg`}
              </Typography>

              {config.note && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 0.5, opacity: 0.85 }}
                >
                  {config.note}
                </Typography>
              )}
            </Box>
          );
        })}
      </Stack>

      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        useFlexGap
      >
        <Typography variant="body2" color="text.secondary" className="tnum">
          {valid ? (
            <>
              <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
                {formatAmount(calories)} cal
              </Box>{' '}
              · {formatKilojoules(calories)}
            </>
          ) : (
            'Enter your weight to see the numbers'
          )}
        </Typography>

        <Button variant="outlined" disabled={!valid} onClick={() => onApply(grams)}>
          Use these numbers
        </Button>
      </Stack>
    </Stack>
  );
}
