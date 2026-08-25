import { beforeEach, describe, expect, it } from 'vitest';
import { localApi } from './localStore';

beforeEach(() => localStorage.clear());

const meal = (over = {}) => ({
  name: 'Oats',
  day: '2026-06-10',
  protein: 10,
  carbs: 30,
  fat: 5,
  ...over,
});

describe('meals', () => {
  it('derives calories from macros and returns them in the summary', async () => {
    await localApi.addMeal(meal());
    const summary = await localApi.getSummary('2026-06-10');

    expect(summary.meals).toHaveLength(1);
    expect(summary.meals[0].calories).toBe(205); // 40 + 120 + 45
    expect(summary.consumed).toEqual({ calories: 205, protein: 10, carbs: 30, fat: 5 });
  });

  it('keeps days separate', async () => {
    await localApi.addMeal(meal());
    await localApi.addMeal(meal({ day: '2026-06-11', name: 'Rice' }));

    expect((await localApi.getSummary('2026-06-10')).meals).toHaveLength(1);
    expect((await localApi.getSummary('2026-06-11')).meals[0].name).toBe('Rice');
  });

  it('rejects a blank name and negative macros with field errors', async () => {
    await expect(localApi.addMeal(meal({ name: '  ' }))).rejects.toMatchObject({
      fields: { name: 'is required' },
    });
    await expect(localApi.addMeal(meal({ protein: -5 }))).rejects.toMatchObject({
      fields: { protein: 'cannot be negative' },
    });
  });

  it('deletes one meal and clears only the requested day', async () => {
    const first = await localApi.addMeal(meal());
    await localApi.addMeal(meal({ name: 'Rice' }));
    await localApi.addMeal(meal({ day: '2026-06-11' }));

    await localApi.deleteMeal(first._id);
    expect((await localApi.getSummary('2026-06-10')).meals).toHaveLength(1);

    const { deleted } = await localApi.clearDay('2026-06-10');
    expect(deleted).toBe(1);
    expect((await localApi.getSummary('2026-06-10')).meals).toHaveLength(0);
    // The other day is untouched -- the bug the old reset endpoint had.
    expect((await localApi.getSummary('2026-06-11')).meals).toHaveLength(1);
  });
});

describe('targets', () => {
  it('fills in calories from the macros when none is given', async () => {
    const { target } = await localApi.setTarget({
      day: '2026-06-10',
      protein: 150,
      carbs: 200,
      fat: 60,
    });
    expect(target.calories).toBe(1940);
  });

  it('keeps an explicit calorie goal that disagrees with the macros', async () => {
    const { target } = await localApi.setTarget({
      day: '2026-06-10',
      protein: 150,
      carbs: 200,
      fat: 60,
      calories: 2000,
    });
    expect(target.calories).toBe(2000);
  });

  it('carries a target forward to later days and marks it inherited', async () => {
    await localApi.setTarget({ day: '2026-06-01', protein: 150, carbs: 200, fat: 60 });

    const later = await localApi.getSummary('2026-06-10');
    expect(later.inherited).toBe(true);
    expect(later.target.protein).toBe(150);

    const earlier = await localApi.getSummary('2026-05-30');
    expect(earlier.target).toBeNull();
  });

  it('reports what is left, going negative when over', async () => {
    await localApi.setTarget({ day: '2026-06-10', protein: 20, carbs: 20, fat: 20, calories: 400 });
    await localApi.addMeal(meal({ protein: 30, carbs: 10, fat: 5 }));

    const { remaining } = await localApi.getSummary('2026-06-10');
    expect(remaining.protein).toBe(-10);
    expect(remaining.carbs).toBe(10);
  });
});

describe('backup', () => {
  it('round-trips an export through an import', async () => {
    await localApi.addMeal(meal());
    await localApi.setTarget({ day: '2026-06-10', protein: 1, carbs: 1, fat: 1 });

    const exported = await localApi.exportAll();
    localStorage.clear();
    await localApi.importAll(exported);

    const summary = await localApi.getSummary('2026-06-10');
    expect(summary.meals).toHaveLength(1);
    expect(summary.target).not.toBeNull();
  });

  it('refuses a file that is not an export', async () => {
    await expect(localApi.importAll({ nope: true })).rejects.toThrow(/Macro Tracker export/);
  });
});
