import mongoose from 'mongoose';
import { caloriesFromMacros, round1 } from '../lib/macros.js';

const mealSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    /** Calendar day the meal belongs to, as the client's local `YYYY-MM-DD`. */
    day: { type: String, required: true, index: true },
    /** Wall-clock moment, kept for ordering and display only. */
    eatenAt: { type: Date, default: Date.now },
    protein: { type: Number, required: true, min: 0 },
    carbs: { type: Number, required: true, min: 0 },
    fat: { type: Number, required: true, min: 0 },
    /** Derived from the macros on every save; never trusted from the client. */
    calories: { type: Number, required: true, min: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

mealSchema.index({ day: 1, eatenAt: 1 });

mealSchema.pre('validate', function setDerivedCalories() {
  this.calories = round1(caloriesFromMacros(this));
});

export const Meal = mongoose.model('Meal', mealSchema);
