import { ApiError } from './ApiError';

/** Parses a gram field, returning `[value, errorMessage]`. */
function parseGrams(raw) {
  if (raw === '' || raw == null) return [0, null];
  const value = Number(raw);
  if (!Number.isFinite(value)) return [0, 'must be a number'];
  if (value < 0) return [0, 'cannot be negative'];
  if (value > 10_000) return [0, 'is unrealistically large'];
  return [Math.round(value * 10) / 10, null];
}

/**
 * Validates macro input the same way the server does, so the local-storage
 * mode and the API mode produce identical inline form errors.
 */
export function validateMacros(input, { requireName = false } = {}) {
  const fields = {};
  const result = {};

  if (requireName) {
    const name = String(input.name ?? '').trim();
    if (!name) fields.name = 'is required';
    else if (name.length > 120) fields.name = 'is too long';
    result.name = name;
  }

  for (const key of ['protein', 'carbs', 'fat']) {
    const [value, error] = parseGrams(input[key]);
    if (error) fields[key] = error;
    else result[key] = value;
  }

  if (input.calories !== undefined && input.calories !== '') {
    const [value, error] = parseGrams(input.calories);
    if (error) fields.calories = error;
    else result.calories = value;
  }

  if (Object.keys(fields).length > 0) {
    throw new ApiError('Invalid request', { status: 400, fields });
  }

  return result;
}
