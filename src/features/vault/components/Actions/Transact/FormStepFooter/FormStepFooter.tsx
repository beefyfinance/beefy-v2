import { createSelector } from '@reduxjs/toolkit';
import { lazy, memo, type ReactNode } from 'react';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import { TransactMode } from '../../../../../data/reducers/wallet/transact-types.ts';
import {
  selectHasUserDepositInVault,
  selectUserVaultBalanceInDepositTokenInBoosts,
  selectUserVaultBalanceInShareTokenIncludingDisplaced,
  selectUserVaultBalanceNotInActiveBoostInShareToken,
} from '../../../../../data/selectors/balance.ts';
import { selectCurrentBoostByVaultIdOrUndefined } from '../../../../../data/selectors/boosts.ts';
import { selectVaultActiveExtraRewardTokens } from '../../../../../data/selectors/rewards.ts';
import {
  selectTransactMode,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact.ts';
import type { BeefyState } from '../../../../../data/store/types.ts';

const BoostDepositNotice = lazy(() => import('./DepositBoostNotice.tsx'));
const DepositClaimNotice = lazy(() => import('./DepositClaimNotice.tsx'));
const WithdrawBoostNotice = lazy(() => import('./WithdrawBoostNotice.tsx'));

const selectBoostDepositNotice = createSelector(
  [
    selectCurrentBoostByVaultIdOrUndefined,
    selectUserVaultBalanceInShareTokenIncludingDisplaced,
    selectUserVaultBalanceNotInActiveBoostInShareToken,
  ],
  (boost, inVaultAnywhere, notInActiveBoost) => {
    if (!!boost && (inVaultAnywhere.isZero() || !notInActiveBoost.isZero())) {
      return (vaultId: VaultEntity['id']) => (
        <BoostDepositNotice vaultId={vaultId} rewardTokens={boost.rewards} />
      );
    }

    return undefined;
  }
);

const selectDepositClaimNotice = createSelector(
  [selectHasUserDepositInVault, selectVaultActiveExtraRewardTokens],
  (deposited, tokens) => {
    if (!deposited && tokens && tokens.length) {
      return () => <DepositClaimNotice rewardTokens={tokens} />;
    }

    return undefined;
  }
);

const selectWithdrawBoostNotice = createSelector(
  [selectUserVaultBalanceInDepositTokenInBoosts],
  balance => {
    if (balance && !balance.isZero()) {
      return (vaultId: VaultEntity['id']) => (
        <WithdrawBoostNotice vaultId={vaultId} balance={balance} />
      );
    }

    return undefined;
  }
);

type FooterSelectorResult = (vaultId: VaultEntity['id']) => ReactNode;

type FooterSelector = (
  state: BeefyState,
  vaultId: VaultEntity['id']
) => FooterSelectorResult | undefined;

type ModeToFooters = {
  [K in TransactMode]?: FooterSelector[];
};

const modeToFooters: ModeToFooters = {
  [TransactMode.Deposit]: [selectBoostDepositNotice, selectDepositClaimNotice],
  [TransactMode.Withdraw]: [selectWithdrawBoostNotice],
};

const selectFooter = createSelector(
  [selectTransactMode, selectTransactVaultId, (state: BeefyState) => state],
  (mode, vaultId, state) => {
    const footers = modeToFooters[mode];
    if (!footers) {
      return null;
    }

    // Check each footer selector in order
    if (mode === TransactMode.Deposit) {
      const boostDepositNotice = selectBoostDepositNotice(state, vaultId);
      if (boostDepositNotice) {
        return boostDepositNotice(vaultId);
      }
      const depositClaimNotice = selectDepositClaimNotice(state, vaultId);
      if (depositClaimNotice) {
        return depositClaimNotice();
      }
    } else if (mode === TransactMode.Withdraw) {
      const withdrawBoostNotice = selectWithdrawBoostNotice(state, vaultId);
      if (withdrawBoostNotice) {
        return withdrawBoostNotice(vaultId);
      }
    }

    return null;
  }
);

export const FormStepFooter = memo(function FormStepFooter() {
  return useAppSelector(selectFooter);
});
