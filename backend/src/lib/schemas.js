import { z } from 'zod';
import { isDayKey } from './dates.js';

/**
 * Grams: non-negative, finite, at most one decimal place. Strings are accepted
 * so form fields need no pre-parsing, and every failure carries a usable message.
 */
const grams = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() !== '' ? Number(value) : value),
  z
    .number({ invalid_type_error: 'must be a number', required_error: 'is required' })
    .finite('must be a number')
    .min(0, 'cannot be negative')
    .max(10_000, 'is unrealistically large')
    .transform((value) => Math.round(value * 10) / 10),
);

export const dayKeySchema = z
  .string()
  .refine(isDayKey, { message: 'must be a calendar date in YYYY-MM-DD form' });

export const mealInputSchema = z.object({
  name: z.string().trim().min(1, 'is required').max(120),
  day: dayKeySchema.optional(),
  eatenAt: z.coerce.date().optional(),
  protein: grams,
  carbs: grams,
  fat: grams,
});

/** Every field optional, but at least one must be present. */
export const mealPatchSchema = mealInputSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, { message: 'No fields to update' });

export const targetInputSchema = z.object({
  day: dayKeySchema.optional(),
  protein: grams,
  carbs: grams,
  fat: grams,
  /**
   * Optional. A calorie goal is allowed to differ from the macro grams -- people
   * round their numbers -- so we store what was asked for and let the UI surface
   * the difference instead of rejecting the request.
   */
  calories: grams.optional(),
});

export const dayQuerySchema = z.object({
  day: dayKeySchema.optional(),
});
