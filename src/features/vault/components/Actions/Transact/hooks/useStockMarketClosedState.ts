import { useMemo, useState } from 'react';
import { useStockMarketWeekend } from '../../../../../data/hooks/stock-market.ts';
import { selectVaultStockTokens } from '../../../../../data/selectors/stock-market.ts';
import { selectTransactVaultId } from '../../../../../data/selectors/transact.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';

export type StockMarketClosedState = {
  /** the vault holds a tokenized stock and its market is shut for the weekend */
  shouldConfirm: boolean;
  confirmed: boolean;
  setConfirmed: (confirmed: boolean) => void;
  /** action must stay disabled until the closed market is acknowledged */
  isDisabled: boolean;
};

/**
 * Gates deposits and withdrawals while the equity market behind a tokenized stock is shut,
 * since the on-chain price can drift away from the last close over the weekend.
 */
export function useStockMarketClosedState(): StockMarketClosedState {
  const weekend = useStockMarketWeekend();
  const vaultId = useAppSelector(selectTransactVaultId);
  const stockTokens = useAppSelector(state => selectVaultStockTokens(state, vaultId));
  const shouldConfirm = !!weekend && stockTokens.length > 0;

  const [confirmed, setConfirmed] = useState(false);

  // drop the tick when the market reopens mid-session so a later weekend asks again;
  // keyed on the close instant, not the object, so a re-derived identical window keeps the tick
  const resetKey = weekend?.closedAt.getTime() ?? 0;
  const [lastResetKey, setLastResetKey] = useState(resetKey);
  if (lastResetKey !== resetKey) {
    setLastResetKey(resetKey);
    setConfirmed(false);
  }

  return useMemo(() => {
    const isConfirmed = shouldConfirm && confirmed;
    return {
      shouldConfirm,
      confirmed: isConfirmed,
      setConfirmed,
      isDisabled: shouldConfirm && !isConfirmed,
    };
  }, [shouldConfirm, confirmed]);
}
