import test from 'node:test';
import assert from 'node:assert/strict';
import { isDayKey, toDayKey, shiftDay } from '../src/lib/dates.js';

test('isDayKey accepts real calendar dates', () => {
  assert.ok(isDayKey('2026-01-31'));
  assert.ok(isDayKey('2024-02-29'));
});

test('isDayKey rejects malformed and impossible dates', () => {
  for (const bad of ['2026-1-1', '26-01-01', '2026-02-31', '2023-02-29', 'today', '', null]) {
    assert.equal(isDayKey(bad), false, `${bad} should be rejected`);
  }
});

test('toDayKey uses local calendar fields, not UTC', () => {
  // 11pm local on the 5th stays the 5th regardless of the server's offset.
  assert.equal(toDayKey(new Date(2026, 0, 5, 23, 30)), '2026-01-05');
});

test('shiftDay crosses month and year boundaries', () => {
  assert.equal(shiftDay('2026-01-01', -1), '2025-12-31');
  assert.equal(shiftDay('2024-02-28', 1), '2024-02-29');
  assert.equal(shiftDay('2026-03-01', -1), '2026-02-28');
});
