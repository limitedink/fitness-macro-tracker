import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';

const EMPTY_TOTALS = { calories: 0, protein: 0, carbs: 0, fat: 0 };

/**
 * Owns everything shown for one day: the goal, its meals and the derived totals.
 * Mutations re-read the day from the server, which stays the single source of
 * truth -- no client-side running totals to fall out of sync.
 */
export function useDaySummary(day) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(
    async (signal) => {
      try {
        const summary = await api.getSummary(day, signal);
        if (signal?.aborted) return;
        setData(summary);
        setError(null);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [day],
  );

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const refresh = useCallback(() => load(), [load]);

  return {
    day,
    target: data?.target ?? null,
    inherited: data?.inherited ?? false,
    meals: data?.meals ?? [],
    consumed: data?.consumed ?? EMPTY_TOTALS,
    remaining: data?.remaining ?? null,
    loading,
    error,
    refresh,
  };
}
