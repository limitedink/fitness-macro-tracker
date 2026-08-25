/**
 * Mirrors the server's Atwater factors so the form can preview calories live.
 *
 * A note on units: these values are kilocalories. The UI labels them "cal"
 * because that is what food packaging calls them -- the "Calorie" on a nutrition
 * label is one kilocalorie -- and mixing "kcal" into a food app reads as a
 * second, different number. Kilojoules are shown alongside as the SI unit.
 */
export const CALORIES_PER_GRAM = Object.freeze({ protein: 4, carbs: 4, fat: 9 });

export const MACROS = Object.freeze([
  { key: 'protein', label: 'Protein' },
  { key: 'carbs', label: 'Carbs' },
  { key: 'fat', label: 'Fat' },
]);

export function caloriesFromMacros({ protein, carbs, fat } = {}) {
  return (
    toNumber(protein) * CALORIES_PER_GRAM.protein +
    toNumber(carbs) * CALORIES_PER_GRAM.carbs +
    toNumber(fat) * CALORIES_PER_GRAM.fat
  );
}

export function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Drops a trailing ".0" so whole numbers read as "42", not "42.0". */
export function formatAmount(value) {
  const rounded = Math.round(toNumber(value) * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

/**
 * Kilojoules are the SI energy unit printed beside calories on food labels in
 * the EU, UK, Australia and New Zealand. The factor is exact by definition.
 */
export const KJ_PER_KCAL = 4.184;

export function toKilojoules(kcal) {
  return toNumber(kcal) * KJ_PER_KCAL;
}

/** e.g. `589` -> "2,464 kJ". Grouped, because the numbers get large. */
export function formatKilojoules(kcal, { withUnit = true } = {}) {
  const value = Math.round(toKilojoules(kcal)).toLocaleString();
  return withUnit ? `${value} kJ` : value;
}

export function percentOf(value, target) {
  if (!target) return 0;
  return (toNumber(value) / target) * 100;
}

/**
 * Grams per kilogram of bodyweight, the way macro targets are usually
 * prescribed. The ranges are the ones this app was set up around; the defaults
 * reproduce a typical cut for an ~80 kg lifter (188 g / 240 g / 60 g).
 */
export const BODYWEIGHT_RATIOS = Object.freeze({
  protein: {
    min: 1.6,
    max: 3,
    step: 0.05,
    default: 2.35,
    note:
      '2.35 g/kg is the usual starting point. Go higher in a cut, up to 3 g/kg. ' +
      'Women generally need slightly less, around 2.05–2.6 g/kg.',
  },
  carbs: { min: 1, max: 4.5, step: 0.1, default: 3 },
  fat: { min: 0.5, max: 1, step: 0.05, default: 0.75 },
});

/** Sensible bounds for a bodyweight entry, in kilograms. */
export const WEIGHT_LIMITS = Object.freeze({ min: 30, max: 250 });

/** Grams of each macro for a bodyweight and a set of g/kg ratios. */
export function macrosFromWeight(kg, ratios) {
  const weight = toNumber(kg);

  return {
    protein: Math.round(weight * toNumber(ratios.protein)),
    carbs: Math.round(weight * toNumber(ratios.carbs)),
    fat: Math.round(weight * toNumber(ratios.fat)),
  };
}

/** The gram range a ratio slider can produce at a given bodyweight. */
export function ratioRange(kg, macro) {
  const { min, max } = BODYWEIGHT_RATIOS[macro];
  const weight = toNumber(kg);
  return { min: Math.round(weight * min), max: Math.round(weight * max) };
}
