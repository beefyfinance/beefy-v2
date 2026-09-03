import { useEffect, useState } from 'react';
import { getStockMarketState, type StockMarketWeekend } from '../../../helpers/stock-market.ts';

/**
 * Longest we will sleep before re-checking. Timers run on a monotonic clock that stops while the
 * device is suspended, so a single multi-day deadline can come due long after the boundary it was
 * armed for - this is a safety gate, so cap the blind interval rather than trust one timer.
 */
const MAX_RECHECK_DELAY = 5 * 60 * 1000;

/**
 * The weekend the equity market is currently shut for, or undefined while it is open.
 * Settles on the boundary, and re-checks whenever the tab becomes visible again.
 */
export function useStockMarketWeekend(): StockMarketWeekend | undefined {
  const [weekend, setWeekend] = useState(() => getStockMarketState(new Date()).weekend);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const sync = () => {
      const next = getStockMarketState(new Date());
      // keep the previous object when the window is unchanged, so a re-check costs no re-render
      setWeekend(prev =>
        prev?.closedAt.getTime() === next.weekend?.closedAt.getTime() ? prev : next.weekend
      );
      clearTimeout(timeout);
      timeout = setTimeout(
        sync,
        // floored so a timer firing a touch early re-checks shortly instead of spinning
        Math.min(MAX_RECHECK_DELAY, Math.max(1000, next.nextChangeAt.getTime() - Date.now()))
      );
    };

    sync();
    document.addEventListener('visibilitychange', sync);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  return weekend;
}
