import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { BIG_ZERO } from '../../../../helpers/big-number.ts';
import { transactInit } from '../../../data/actions/transact.ts';
import {
  getCowcentratedWrapperIds,
  isCowcentratedVault,
  type VaultCowcentrated,
  type VaultEntity,
} from '../../../data/entities/vault.ts';
import { TransactMode } from '../../../data/reducers/wallet/transact-types.ts';
import {
  selectClmMigrateVaultId,
  selectHasUserDepositInVault,
  selectUserVaultBalanceInUsdIncludingDisplaced,
} from '../../../data/selectors/balance.ts';
import { selectClmBoostVaultId, selectTransactMode } from '../../../data/selectors/transact.ts';
import { selectVaultById } from '../../../data/selectors/vaults.ts';
import { useAppDispatch, useAppSelector } from '../../../data/store/hooks.ts';
import {
  clmModeToVaultId,
  type ClmMode,
  pickClmPositionSide,
  resolveClmMode,
} from './resolve-clm-mode.ts';

export type ClmModeContextValue = {
  clmId: VaultEntity['id'];
  /** raw group ids; `pool`/`vault` are the *active* wrappers, the arrays are any status */
  ids: VaultCowcentrated['cowcentratedIds'];
  mode: ClmMode;
  /** the Deposit tab's mode, whichever tab is open */
  depositMode: ClmMode;
  /** holds any pool wrapper, active or retired */
  heldPool: boolean;
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

/** set where a CLM chart stands for the whole group without a vault page around it: a dashboard CLM row */
export const ClmGroupScopeContext = createContext(false);

/** whether CLM charts and headers cover every held side: the merged vault page, or a dashboard CLM row */
export function useClmGroupScope(): boolean {
  const scoped = useContext(ClmGroupScopeContext);
  const clmMode = useClmMode();
  return scoped || !!clmMode;
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
  // withdraw takes from a position, so it opens on the side holding the most — the deposit
  // default would otherwise land a both-sides holder on whichever side product prefers, however
  // little is in it. Returns a plain string, so no selector equality fn is needed.
  const heldSide = useAppSelector(state => {
    if (!ids) {
      return undefined;
    }
    const totalUsd = (memberIds: string[]) =>
      memberIds.reduce(
        (sum, id) => sum.plus(selectUserVaultBalanceInUsdIncludingDisplaced(state, id)),
        BIG_ZERO
      );
    return pickClmPositionSide(totalUsd(ids.vaults), totalUsd(ids.pools));
  });
  const transactMode = useAppSelector(selectTransactMode);
  const isWithdraw = transactMode === TransactMode.Withdraw;
  // boosts and migrations belong to one side, so their tabs bind there whatever the deposit pick is
  const tabVaultId = useAppSelector(state =>
    !ids ? undefined
    : transactMode === TransactMode.Boost ? selectClmBoostVaultId(state, vaultId)
    : transactMode === TransactMode.Migrate ? selectClmMigrateVaultId(state, vaultId)
    : undefined
  );
  // withdrawing the whole of a picked side leaves that pick unselectable, and the selector then
  // collapses to a single card pointing at the empty position — drop it and re-derive
  const picked =
    isWithdraw ?
      pickedWithdraw && (pickedWithdraw === 'vault' ? heldVault : heldPool) ?
        pickedWithdraw
      : undefined
    : pickedDeposit;
  // until the user picks, both tabs re-derive from balances as they load
  const mode =
    tabVaultId && ids ?
      ids.vaults.includes(tabVaultId) ?
        'vault'
      : 'pool'
    : (picked ??
      (isWithdraw && heldSide ? heldSide
      : ids ? resolveClmMode(ids, heldVault, heldPool, isWithdraw)
      : 'vault'));
  const depositMode =
    pickedDeposit ?? (ids ? resolveClmMode(ids, heldVault, heldPool, false) : 'vault');

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
      depositMode,
      heldPool,
      selectedVaultId: tabVaultId ?? clmModeToVaultId(ids, mode),
      vaultSideId: ids.vault ?? ids.vaults[0],
      poolSideId: ids.pool ?? ids.pools[0],
      setMode,
    };
  }, [ids, mode, depositMode, heldPool, tabVaultId, setMode]);
}
