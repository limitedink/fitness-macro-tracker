/**
 * Atwater factors: the energy each gram of a macronutrient contributes.
 * Calories are always derived from grams so a meal can never disagree with itself.
 */
export const CALORIES_PER_GRAM = Object.freeze({
  protein: 4,
  carbs: 4,
  fat: 9,
});

export const MACRO_KEYS = Object.freeze(['protein', 'carbs', 'fat']);

/** Calories implied by a set of macro grams. */
export function caloriesFromMacros({ protein = 0, carbs = 0, fat = 0 } = {}) {
  return (
    protein * CALORIES_PER_GRAM.protein +
    carbs * CALORIES_PER_GRAM.carbs +
    fat * CALORIES_PER_GRAM.fat
  );
}

/** Round to one decimal place, avoiding float dust like 12.300000000000001. */
export function round1(value) {
  return Math.round(value * 10) / 10;
}

/** Sum the macros of many meals into a single totals object. */
export function sumMeals(meals = []) {
  const totals = meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.calories ?? 0),
      protein: acc.protein + (meal.protein ?? 0),
      carbs: acc.carbs + (meal.carbs ?? 0),
      fat: acc.fat + (meal.fat ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  return {
    calories: round1(totals.calories),
    protein: round1(totals.protein),
    carbs: round1(totals.carbs),
    fat: round1(totals.fat),
  };
}

/** What is left of each target after the consumed totals. Can go negative. */
export function remaining(target, consumed) {
  return {
    calories: round1((target?.calories ?? 0) - consumed.calories),
    protein: round1((target?.protein ?? 0) - consumed.protein),
    carbs: round1((target?.carbs ?? 0) - consumed.carbs),
    fat: round1((target?.fat ?? 0) - consumed.fat),
  };
}
