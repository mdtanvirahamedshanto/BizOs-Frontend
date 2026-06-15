import { useCallback, useState } from 'react';

export function useCursorPagination() {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [history, setHistory] = useState<(string | undefined)[]>([]);

  const reset = useCallback(() => {
    setCursor(undefined);
    setHistory([]);
  }, []);

  const next = useCallback((nextCursor?: string | null) => {
    if (!nextCursor) return;
    setHistory((prev) => [...prev, cursor]);
    setCursor(nextCursor);
  }, [cursor]);

  const prev = useCallback(() => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const nextHistory = [...prev];
      const previousCursor = nextHistory.pop();
      setCursor(previousCursor);
      return nextHistory;
    });
  }, []);

  return {
    cursor,
    reset,
    next,
    prev,
    hasPrev: history.length > 0,
  };
}
