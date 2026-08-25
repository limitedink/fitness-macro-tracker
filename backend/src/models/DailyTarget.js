import mongoose from 'mongoose';
import { caloriesFromMacros, round1 } from '../lib/macros.js';

/**
 * One goal document per calendar day. Consumed totals are deliberately absent:
 * they are summed from meals on read, so the two can never drift apart.
 */
const dailyTargetSchema = new mongoose.Schema(
  {
    day: { type: String, required: true, unique: true },
    protein: { type: Number, required: true, min: 0 },
    carbs: { type: Number, required: true, min: 0 },
    fat: { type: Number, required: true, min: 0 },
    calories: { type: Number, required: true, min: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

/** Calories the macro grams actually add up to, whatever goal was typed in. */
dailyTargetSchema.virtual('caloriesFromMacros').get(function derived() {
  return round1(caloriesFromMacros(this));
});

export const DailyTarget = mongoose.model('DailyTarget', dailyTargetSchema);
