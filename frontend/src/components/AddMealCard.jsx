import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { MACROS, caloriesFromMacros, formatAmount, formatKilojoules } from '../lib/macros';
import { MACRO_COLORS } from '../theme';
import { api, ApiError } from '../lib/api';
import { useToast } from '../context/ToastContext';

const EMPTY = { name: '', protein: '', carbs: '', fat: '' };

export function AddMealCard({ day, onAdded }) {
  const [form, setForm] = useState(EMPTY);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const calories = caloriesFromMacros(form);
  const hasMacros = MACROS.some(({ key }) => form[key] !== '' && Number(form[key]) > 0);

  const update = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFieldErrors({});

    try {
      // Blank macro fields mean zero, which is a common and valid entry.
      const meal = await api.addMeal({
        name: form.name,
        day,
        protein: form.protein || 0,
        carbs: form.carbs || 0,
        fat: form.fat || 0,
      });
      setForm(EMPTY);
      onAdded(meal);
      toast(`Added ${meal.name}`);
    } catch (err) {
      if (err instanceof ApiError) setFieldErrors(err.fields);
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card component="form" onSubmit={handleSubmit}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Typography variant="h6" sx={{ mb: 2.5 }}>
          Add a meal
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="What did you eat?"
            value={form.name}
            onChange={update('name')}
            error={Boolean(fieldErrors.name)}
            helperText={fieldErrors.name}
            placeholder="Chicken and rice"
            autoComplete="off"
            fullWidth
            required
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {MACROS.map(({ key, label }) => (
              <TextField
                key={key}
                label={`${label} (g)`}
                value={form[key]}
                onChange={update(key)}
                error={Boolean(fieldErrors[key])}
                helperText={fieldErrors[key]}
                type="number"
                inputProps={{ min: 0, step: 0.1, inputMode: 'decimal' }}
                fullWidth
                sx={{
                  '& label.Mui-focused': { color: MACRO_COLORS[key] },
                  '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                    borderColor: MACRO_COLORS[key],
                  },
                }}
              />
            ))}
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            useFlexGap
          >
            <Box>
              <Chip
                label={`≈ ${formatAmount(calories)} cal · ${formatKilojoules(calories)}`}
                color={hasMacros ? 'primary' : 'default'}
                variant={hasMacros ? 'filled' : 'outlined'}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                Calories are calculated from the macros — 4/4/9 per gram.
              </Typography>
            </Box>

            <Button
              type="submit"
              variant="contained"
              startIcon={<AddIcon />}
              disabled={saving || !form.name.trim() || !hasMacros}
            >
              {saving ? 'Adding…' : 'Add meal'}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
