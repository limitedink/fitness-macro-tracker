import { Router } from 'express';
import { Meal } from '../models/Meal.js';
import { mealInputSchema, mealPatchSchema, dayQuerySchema } from '../lib/schemas.js';
import { asyncHandler, HttpError } from '../middleware/errors.js';
import { todayKey } from '../lib/dates.js';

export const mealsRouter = Router();

/** GET /api/meals?day=YYYY-MM-DD -- meals for one day, oldest first. */
mealsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { day = todayKey() } = dayQuerySchema.parse(req.query);
    const meals = await Meal.find({ day }).sort({ eatenAt: 1 });
    res.json(meals);
  }),
);

/** POST /api/meals -- calories are computed from the macros, not accepted. */
mealsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const input = mealInputSchema.parse(req.body);
    const meal = await Meal.create({
      ...input,
      day: input.day ?? todayKey(),
      eatenAt: input.eatenAt ?? new Date(),
    });
    res.status(201).json(meal);
  }),
);

/** PATCH /api/meals/:id -- partial edit; calories are recomputed on save. */
mealsRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const updates = mealPatchSchema.parse(req.body);
    const meal = await Meal.findById(req.params.id);
    if (!meal) throw new HttpError(404, 'Meal not found');

    Object.assign(meal, updates);
    await meal.save();
    res.json(meal);
  }),
);

mealsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const meal = await Meal.findByIdAndDelete(req.params.id);
    if (!meal) throw new HttpError(404, 'Meal not found');
    res.json({ deleted: 1, meal });
  }),
);

/**
 * DELETE /api/meals?day=YYYY-MM-DD -- clears a single day.
 * The day is required so this can never wipe the whole history by accident.
 */
mealsRouter.delete(
  '/',
  asyncHandler(async (req, res) => {
    const { day } = dayQuerySchema.parse(req.query);
    if (!day) throw new HttpError(400, 'A day is required to clear meals');

    const { deletedCount } = await Meal.deleteMany({ day });
    res.json({ deleted: deletedCount, day });
  }),
);
