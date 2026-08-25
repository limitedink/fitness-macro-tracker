import { Router } from 'express';
import { Meal } from '../models/Meal.js';
import { dayQuerySchema } from '../lib/schemas.js';
import { asyncHandler } from '../middleware/errors.js';
import { todayKey } from '../lib/dates.js';
import { sumMeals, remaining } from '../lib/macros.js';
import { resolveTarget } from './dailyTargets.js';

export const summaryRouter = Router();

/**
 * GET /api/summary?day=YYYY-MM-DD
 * Everything one screen needs -- goal, meals, totals, remaining -- in one trip.
 */
summaryRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { day = todayKey() } = dayQuerySchema.parse(req.query);

    const [meals, { target, inherited }] = await Promise.all([
      Meal.find({ day }).sort({ eatenAt: 1 }),
      resolveTarget(day),
    ]);

    const consumed = sumMeals(meals);

    res.json({
      day,
      target,
      inherited,
      meals,
      consumed,
      remaining: target ? remaining(target, consumed) : null,
    });
  }),
);
