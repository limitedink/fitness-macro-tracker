/**
 * Offline data layer. Everything lives in this browser's localStorage, which is
 * what makes the app usable with no server, no database and no accounts --
 * including on a static host such as GitHub Pages.
 *
 * It implements the same interface as the HTTP client in `api.js`, so the rest
 * of the app cannot tell which one it is talking to.
 */
import { ApiError } from './ApiError';
import { validateMacros } from './validate';
import { caloriesFromMacros, toNumber } from './macros';

const STORAGE_KEY = 'macro-tracker:data:v1';

const emptyDb = () => ({ version: 1, meals: [], targets: {} });

function read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyDb();
    const parsed = JSON.parse(raw);
    return { ...emptyDb(), ...parsed };
  } catch {
    // Corrupt or unreadable storage should not brick the app.
    return emptyDb();
  }
}

function write(db) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    throw new ApiError('Could not save — this browser’s storage is full or blocked.');
  }
  return db;
}

const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const round1 = (value) => Math.round(toNumber(value) * 10) / 10;

function sumMeals(meals) {
  return meals.reduce(
    (acc, meal) => ({
      calories: round1(acc.calories + meal.calories),
      protein: round1(acc.protein + meal.protein),
      carbs: round1(acc.carbs + meal.carbs),
      fat: round1(acc.fat + meal.fat),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

/** The day's own target, or the most recent one before it. */
function resolveTarget(db, day) {
  if (db.targets[day]) return { target: db.targets[day], inherited: false };

  const earlier = Object.keys(db.targets)
    .filter((key) => key < day)
    .sort();
  const previous = earlier.at(-1);

  return previous ? { target: db.targets[previous], inherited: true } : { target: null, inherited: false };
}

export const localApi = {
  async getSummary(day) {
    const db = read();
    const meals = db.meals
      .filter((meal) => meal.day === day)
      .sort((a, b) => String(a.eatenAt).localeCompare(String(b.eatenAt)));

    const { target, inherited } = resolveTarget(db, day);
    const consumed = sumMeals(meals);

    return {
      day,
      target,
      inherited,
      meals,
      consumed,
      remaining: target
        ? {
            calories: round1(target.calories - consumed.calories),
            protein: round1(target.protein - consumed.protein),
            carbs: round1(target.carbs - consumed.carbs),
            fat: round1(target.fat - consumed.fat),
          }
        : null,
    };
  },

  async addMeal(input) {
    const valid = validateMacros(input, { requireName: true });
    const db = read();

    const meal = {
      _id: newId(),
      ...valid,
      day: input.day,
      eatenAt: input.eatenAt ?? new Date().toISOString(),
      calories: round1(caloriesFromMacros(valid)),
    };

    db.meals.push(meal);
    write(db);
    return meal;
  },

  async updateMeal(id, updates) {
    const db = read();
    const meal = db.meals.find((candidate) => candidate._id === id);
    if (!meal) throw new ApiError('Meal not found', { status: 404 });

    const valid = validateMacros({ ...meal, ...updates }, { requireName: true });
    Object.assign(meal, valid, { calories: round1(caloriesFromMacros(valid)) });

    write(db);
    return meal;
  },

  async deleteMeal(id) {
    const db = read();
    const index = db.meals.findIndex((meal) => meal._id === id);
    if (index === -1) throw new ApiError('Meal not found', { status: 404 });

    const [meal] = db.meals.splice(index, 1);
    write(db);
    return { deleted: 1, meal };
  },

  async clearDay(day) {
    const db = read();
    const before = db.meals.length;
    db.meals = db.meals.filter((meal) => meal.day !== day);
    write(db);
    return { deleted: before - db.meals.length, day };
  },

  async setTarget(input) {
    const valid = validateMacros(input);
    const db = read();
    const { day } = input;

    const target = {
      _id: db.targets[day]?._id ?? newId(),
      day,
      ...valid,
      calories: valid.calories ?? round1(caloriesFromMacros(valid)),
    };

    db.targets[day] = target;
    write(db);
    return { day, target, inherited: false };
  },

  /** Whole-database export, for backups or moving to another machine. */
  async exportAll() {
    return read();
  },

  async importAll(payload) {
    if (!payload || !Array.isArray(payload.meals) || typeof payload.targets !== 'object') {
      throw new ApiError('That file does not look like a Macro Tracker export.');
    }
    write({ ...emptyDb(), meals: payload.meals, targets: payload.targets });
    return { meals: payload.meals.length, days: Object.keys(payload.targets).length };
  },
};
