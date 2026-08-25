import test from 'node:test';
import assert from 'node:assert/strict';
import { mealInputSchema, targetInputSchema } from '../src/lib/schemas.js';

test('mealInputSchema coerces numeric strings from form fields', () => {
  const parsed = mealInputSchema.parse({ name: ' Oats ', protein: '12.5', carbs: 40, fat: '3' });
  assert.equal(parsed.name, 'Oats');
  assert.equal(parsed.protein, 12.5);
  assert.equal(parsed.fat, 3);
});

test('mealInputSchema rejects negative and non-numeric macros', () => {
  assert.throws(() => mealInputSchema.parse({ name: 'x', protein: -1, carbs: 0, fat: 0 }));
  assert.throws(() => mealInputSchema.parse({ name: 'x', protein: 'abc', carbs: 0, fat: 0 }));
});

test('mealInputSchema requires a name', () => {
  assert.throws(() => mealInputSchema.parse({ name: '   ', protein: 1, carbs: 1, fat: 1 }));
});

test('targetInputSchema allows a calorie goal that differs from the macro sum', () => {
  const parsed = targetInputSchema.parse({ protein: 180, carbs: 200, fat: 60, calories: 2200 });
  assert.equal(parsed.calories, 2200);
});

test('targetInputSchema rejects an invalid day key', () => {
  assert.throws(() => targetInputSchema.parse({ day: '2026-13-01', protein: 1, carbs: 1, fat: 1 }));
});
