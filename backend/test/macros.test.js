import test from 'node:test';
import assert from 'node:assert/strict';
import { caloriesFromMacros, sumMeals, remaining, round1 } from '../src/lib/macros.js';

test('caloriesFromMacros applies Atwater factors', () => {
  assert.equal(caloriesFromMacros({ protein: 10, carbs: 10, fat: 10 }), 170);
  assert.equal(caloriesFromMacros({}), 0);
  assert.equal(caloriesFromMacros({ fat: 0.5 }), 4.5);
});

test('round1 removes floating point dust', () => {
  assert.equal(round1(0.1 + 0.2), 0.3);
  assert.equal(round1(12.34), 12.3);
});

test('sumMeals totals every macro', () => {
  const meals = [
    { calories: 170, protein: 10, carbs: 10, fat: 10 },
    { calories: 85, protein: 5, carbs: 5, fat: 5 },
  ];
  assert.deepEqual(sumMeals(meals), { calories: 255, protein: 15, carbs: 15, fat: 15 });
});

test('sumMeals of nothing is all zeroes, not NaN', () => {
  assert.deepEqual(sumMeals([]), { calories: 0, protein: 0, carbs: 0, fat: 0 });
});

test('remaining goes negative once a target is exceeded', () => {
  const target = { calories: 2000, protein: 150, carbs: 200, fat: 60 };
  const consumed = { calories: 2200, protein: 150, carbs: 180, fat: 70 };
  assert.deepEqual(remaining(target, consumed), {
    calories: -200,
    protein: 0,
    carbs: 20,
    fat: -10,
  });
});
