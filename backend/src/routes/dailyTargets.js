import { Router } from 'express';
import { DailyTarget } from '../models/DailyTarget.js';
import { targetInputSchema, dayQuerySchema } from '../lib/schemas.js';
import { asyncHandler, HttpError } from '../middleware/errors.js';
import { todayKey } from '../lib/dates.js';
import { caloriesFromMacros, round1 } from '../lib/macros.js';

export const targetsRouter = Router();

/**
 * The goal in force on a given day: the day's own target, or failing that the
 * most recent earlier one. Goals carry forward, so they are set once, not daily.
 */
export async function resolveTarget(day) {
  const exact = await DailyTarget.findOne({ day });
  if (exact) return { target: exact, inherited: false };

  const previous = await DailyTarget.findOne({ day: { $lt: day } }).sort({ day: -1 });
  return { target: previous, inherited: Boolean(previous) };
}

/** GET /api/daily-targets?day=YYYY-MM-DD */
targetsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { day = todayKey() } = dayQuerySchema.parse(req.query);
    const { target, inherited } = await resolveTarget(day);
    res.json({ day, target, inherited });
  }),
);

/** PUT /api/daily-targets -- upserts the goal for one day. */
targetsRouter.put(
  '/',
  asyncHandler(async (req, res) => {
    const input = targetInputSchema.parse(req.body);
    const day = input.day ?? todayKey();
    const calories = input.calories ?? round1(caloriesFromMacros(input));

    const target = await DailyTarget.findOneAndUpdate(
      { day },
      { day, protein: input.protein, carbs: input.carbs, fat: input.fat, calories },
      { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );

    res.json({ day, target, inherited: false });
  }),
);

/** DELETE /api/daily-targets?day=... -- drops one day's override. */
targetsRouter.delete(
  '/',
  asyncHandler(async (req, res) => {
    const { day } = dayQuerySchema.parse(req.query);
    if (!day) throw new HttpError(400, 'A day is required to delete a target');

    const { deletedCount } = await DailyTarget.deleteOne({ day });
    res.json({ deleted: deletedCount, day });
  }),
);
