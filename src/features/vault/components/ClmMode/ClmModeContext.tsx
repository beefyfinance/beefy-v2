import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { transactInit } from '../../../data/actions/transact.ts';
import {
  getCowcentratedWrapperIds,
  isCowcentratedVault,
  type VaultCowcentrated,
  type VaultEntity,
} from '../../../data/entities/vault.ts';
import { TransactMode } from '../../../data/reducers/wallet/transact-types.ts';
import { selectHasUserDepositInVault } from '../../../data/selectors/balance.ts';
import { selectTransactMode } from '../../../data/selectors/transact.ts';
import { selectVaultById } from '../../../data/selectors/vaults.ts';
import { useAppDispatch, useAppSelector } from '../../../data/store/hooks.ts';
import { clmModeToVaultId, type ClmMode, resolveClmMode } from './resolve-clm-mode.ts';

export type ClmModeContextValue = {
  clmId: VaultEntity['id'];
  /** raw group ids; `pool`/`vault` are the *active* wrappers, the arrays are any status */
  ids: VaultCowcentrated['cowcentratedIds'];
  mode: ClmMode;
  /** the wrapper the page's mode-dependent sections are bound to */
  selectedVaultId: VaultEntity['id'];
  /** per-side wrapper ids; undefined when that side does not exist */
  vaultSideId: VaultEntity['id'] | undefined;
  poolSideId: VaultEntity['id'] | undefined;
  setMode: (mode: ClmMode, tab?: TransactMode) => void;
};

export const ClmModeContext = createContext<ClmModeContextValue | null>(null);

/** null outside a merged CLM page */
export function useClmMode(): ClmModeContextValue | null {
  return useContext(ClmModeContext);
}

/** Yield-mode state of a merged CLM page; null when the page vault is not a merged CLM */
export function useClmModeController(vaultId: VaultEntity['id']): ClmModeContextValue | null {
  const dispatch = useAppDispatch();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const ids =
    isCowcentratedVault(vault) && getCowcentratedWrapperIds(vault).length > 0 ?
      vault.cowcentratedIds
    : undefined;

  // deposit asks "where should new funds go"; withdraw asks "which position am I taking from".
  // Different questions, so a pick on one tab must not rewrite the other.
  const [pickedDeposit, setPickedDeposit] = useState<ClmMode | undefined>(undefined);
  const [pickedWithdraw, setPickedWithdraw] = useState<ClmMode | undefined>(undefined);
  const heldVault = useAppSelector(
    state => !!ids && ids.vaults.some(id => selectHasUserDepositInVault(state, id))
  );
  const heldPool = useAppSelector(
    state => !!ids && ids.pools.some(id => selectHasUserDepositInVault(state, id))
  );
  const transactMode = useAppSelector(selectTransactMode);
  const isWithdraw = transactMode === TransactMode.Withdraw;
  // withdrawing the whole of a picked side leaves that pick unselectable, and the selector then
  // collapses to a single disabled row pointing at the empty position — drop it and re-derive
  const picked =
    isWithdraw ?
      pickedWithdraw && (pickedWithdraw === 'vault' ? heldVault : heldPool) ?
        pickedWithdraw
      : undefined
    : pickedDeposit;
  // until the user picks, both tabs re-derive from balances as they load
  const mode = picked ?? (ids ? resolveClmMode(ids, heldVault, heldPool, isWithdraw) : 'vault');

  const setMode = useCallback(
    (next: ClmMode, tab?: TransactMode) => {
      if (!ids || next === mode) {
        return;
      }
      // init the form for the new target now so the current Deposit/Withdraw tab survives;
      // retarget because both sides are wrappers of one CLM, so the form must not blank out
      const keepableTab = tab ?? (isWithdraw ? TransactMode.Withdraw : TransactMode.Deposit);
      dispatch(
        transactInit({
          vaultId: clmModeToVaultId(ids, next),
          mode: keepableTab,
          retarget: true,
        })
      );
      if (keepableTab === TransactMode.Withdraw) {
        setPickedWithdraw(next);
      } else {
        setPickedDeposit(next);
      }
    },
    [dispatch, ids, mode, isWithdraw]
  );

  return useMemo(() => {
    if (!ids) {
      return null;
    }
    return {
      clmId: ids.clm,
      ids,
      mode,
      selectedVaultId: clmModeToVaultId(ids, mode),
      vaultSideId: ids.vault ?? ids.vaults[0],
      poolSideId: ids.pool ?? ids.pools[0],
      setMode,
    };
  }, [ids, mode, setMode]);
}
