import { describe, expect, it } from 'vitest';
import {
  BODYWEIGHT_RATIOS,
  caloriesFromMacros,
  formatAmount,
  formatKilojoules,
  macrosFromWeight,
  percentOf,
  ratioRange,
  toKilojoules,
  toNumber,
} from './macros';

describe('caloriesFromMacros', () => {
  it('applies 4/4/9 per gram', () => {
    expect(caloriesFromMacros({ protein: 10, carbs: 10, fat: 10 })).toBe(170);
  });

  it('treats blank and invalid fields as zero', () => {
    expect(caloriesFromMacros({ protein: '', carbs: 'abc', fat: undefined })).toBe(0);
    expect(caloriesFromMacros({ protein: '20' })).toBe(80);
  });
});

describe('formatAmount', () => {
  it('drops a trailing zero decimal', () => {
    expect(formatAmount(42)).toBe('42');
    expect(formatAmount(42.05)).toBe('42.1');
    expect(formatAmount('12.34')).toBe('12.3');
  });

  it('falls back to zero for junk', () => {
    expect(formatAmount(undefined)).toBe('0');
    expect(toNumber('nope')).toBe(0);
  });
});

describe('kilojoules', () => {
  it('converts using the exact 4.184 factor', () => {
    expect(toKilojoules(1)).toBe(4.184);
    expect(toKilojoules(205)).toBeCloseTo(857.72, 2);
  });

  it('formats as a rounded, grouped figure with its unit', () => {
    expect(formatKilojoules(205)).toBe('858 kJ');
    expect(formatKilojoules(0)).toBe('0 kJ');
    // Four digits and up are grouped, which is where this unit spends its time.
    expect(formatKilojoules(2000)).toBe('8,368 kJ');
    expect(formatKilojoules(2000, { withUnit: false })).toBe('8,368');
  });

  it('treats junk as zero rather than NaN', () => {
    expect(formatKilojoules(undefined)).toBe('0 kJ');
  });
});

describe('percentOf', () => {
  it('returns zero rather than Infinity when no target is set', () => {
    expect(percentOf(500, 0)).toBe(0);
    expect(percentOf(50, 200)).toBe(25);
  });
});

describe('macrosFromWeight', () => {
  const defaults = {
    protein: BODYWEIGHT_RATIOS.protein.default,
    carbs: BODYWEIGHT_RATIOS.carbs.default,
    fat: BODYWEIGHT_RATIOS.fat.default,
  };

  it('multiplies bodyweight by the g/kg ratios', () => {
    // 2.35 g/kg at 80 kg is the 188 g protein target this was set up around.
    expect(macrosFromWeight(80, defaults)).toEqual({ protein: 188, carbs: 240, fat: 60 });
  });

  it('returns whole grams across the 77-81 kg band', () => {
    expect(macrosFromWeight(77, defaults).protein).toBe(181);
    expect(macrosFromWeight(81, defaults).protein).toBe(190);
  });

  it('honours a ratio the user has moved off the default', () => {
    expect(macrosFromWeight(80, { ...defaults, carbs: 4 }).carbs).toBe(320);
    expect(macrosFromWeight(80, { ...defaults, fat: 0.5 }).fat).toBe(40);
  });

  it('is zero rather than NaN before a weight is entered', () => {
    expect(macrosFromWeight('', defaults)).toEqual({ protein: 0, carbs: 0, fat: 0 });
  });
});

describe('ratioRange', () => {
  it('reports the grams each slider can reach at a given weight', () => {
    // Carbs top out around 350 g, which is the ceiling this was built for.
    expect(ratioRange(80, 'carbs')).toEqual({ min: 80, max: 360 });
    expect(ratioRange(77, 'fat')).toEqual({ min: 39, max: 77 });
  });
});
