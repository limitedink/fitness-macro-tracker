import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { BodyweightCalculator } from './BodyweightCalculator';
import { MACROS, caloriesFromMacros, formatAmount, formatKilojoules } from '../lib/macros';
import { MACRO_COLORS } from '../theme';
import { api, ApiError } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { formatDayLabel } from '../lib/day';

const blank = { calories: '', protein: '', carbs: '', fat: '' };

export function TargetDialog({ open, day, target, onClose, onSaved }) {
  const [form, setForm] = useState(blank);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const toast = useToast();

  // Re-seed from the current target each time the dialog opens.
  useEffect(() => {
    if (!open) return;
    setForm(
      target
        ? {
            calories: String(target.calories ?? ''),
            protein: String(target.protein ?? ''),
            carbs: String(target.carbs ?? ''),
            fat: String(target.fat ?? ''),
          }
        : blank,
    );
    setFieldErrors({});
    setCalculatorOpen(false);
  }, [open, target]);

  const macroCalories = caloriesFromMacros(form);
  const enteredCalories = Number(form.calories);
  const mismatch =
    form.calories !== '' && Math.abs(macroCalories - enteredCalories) > 5 && macroCalories > 0;

  const update = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const useMacroCalories = () =>
    setForm((prev) => ({ ...prev, calories: String(Math.round(macroCalories)) }));

  /** Fills the gram fields from the calculator, leaving them editable. */
  const applyCalculated = (grams) => {
    setForm((prev) => ({
      ...prev,
      protein: String(grams.protein),
      carbs: String(grams.carbs),
      fat: String(grams.fat),
    }));
    setFieldErrors({});
    setCalculatorOpen(false);
    toast('Filled in from your bodyweight');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFieldErrors({});

    try {
      const { target: saved } = await api.setTarget({
        day,
        protein: form.protein || 0,
        carbs: form.carbs || 0,
        fat: form.fat || 0,
        // Omitted calories fall back to the macro sum on the server.
        ...(form.calories === '' ? {} : { calories: form.calories }),
      });
      onSaved(saved);
      toast('Target saved');
      onClose();
    } catch (err) {
      if (err instanceof ApiError) setFieldErrors(err.fields);
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" component="form" onSubmit={handleSubmit}>
      <DialogTitle sx={{ pb: 0.5 }}>Daily target</DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Applies from {formatDayLabel(day).toLowerCase()} onward until you change it.
        </Typography>

        <Stack spacing={2}>
          {MACROS.map(({ key, label }) => (
            <TextField
              key={key}
              label={label}
              value={form[key]}
              onChange={update(key)}
              error={Boolean(fieldErrors[key])}
              helperText={fieldErrors[key]}
              type="number"
              required
              inputProps={{ min: 0, step: 1, inputMode: 'decimal' }}
              InputProps={{ endAdornment: <InputAdornment position="end">g</InputAdornment> }}
              sx={{
                '& label.Mui-focused': { color: MACRO_COLORS[key] },
                '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: MACRO_COLORS[key] },
              }}
              fullWidth
            />
          ))}

          <TextField
            label="Calorie goal"
            value={form.calories}
            onChange={update('calories')}
            error={Boolean(fieldErrors.calories)}
            helperText={
              fieldErrors.calories ??
              (form.calories === ''
                ? `Leave blank to use ${formatAmount(macroCalories)} cal (${formatKilojoules(macroCalories)}) from the macros.`
                : `That is ${formatKilojoules(enteredCalories)}.`)
            }
            type="number"
            inputProps={{ min: 0, step: 10, inputMode: 'numeric' }}
            InputProps={{ endAdornment: <InputAdornment position="end">cal</InputAdornment> }}
            fullWidth
          />

          {mismatch && (
            <Alert
              severity="info"
              action={
                <Button size="small" onClick={useMacroCalories}>
                  Use {Math.round(macroCalories)}
                </Button>
              }
            >
              Your macros add up to {formatAmount(macroCalories)} cal (
              {formatKilojoules(macroCalories)}).
            </Alert>
          )}

          <Divider>
            <Link
              component="button"
              type="button"
              underline="hover"
              variant="body2"
              onClick={() => setCalculatorOpen((prev) => !prev)}
              sx={{ color: 'text.secondary' }}
            >
              {calculatorOpen ? 'hide' : 'or calculate from bodyweight'}
            </Link>
          </Divider>

          <Collapse in={calculatorOpen} unmountOnExit>
            <BodyweightCalculator onApply={applyCalculated} />
          </Collapse>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={saving}>
          {saving ? 'Saving…' : 'Save target'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
