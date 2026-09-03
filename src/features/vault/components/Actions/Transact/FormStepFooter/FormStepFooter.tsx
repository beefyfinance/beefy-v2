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
  selectTransactBoostForStaking,
  selectTransactBoostForUnstaking,
  selectTransactMode,
  selectTransactUnstakeFromBoostSupported,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact.ts';
import type { BeefyState } from '../../../../../data/store/types.ts';

const BoostDepositNotice = lazy(() => import('./DepositBoostNotice.tsx'));
const DepositClaimNotice = lazy(() => import('./DepositClaimNotice.tsx'));
const WithdrawBoostNotice = lazy(() => import('./WithdrawBoostNotice.tsx'));
const UnstakeBoostNotice = lazy(() => import('./UnstakeBoostNotice.tsx'));

const selectBoostDepositNotice = createSelector(
  [
    selectCurrentBoostByVaultIdOrUndefined,
    selectUserVaultBalanceInShareTokenIncludingDisplaced,
    selectUserVaultBalanceNotInActiveBoostInShareToken,
    selectTransactBoostForStaking,
  ],
  (boost, inVaultAnywhere, notInActiveBoost, stakeable) => {
    if (!!boost && (!!stakeable || inVaultAnywhere.isZero() || !notInActiveBoost.isZero())) {
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
  [
    selectUserVaultBalanceInDepositTokenInBoosts,
    selectTransactBoostForUnstaking,
    selectTransactUnstakeFromBoostSupported,
  ],
  (balance, unstakeable, supported) => {
    if (unstakeable && supported) {
      return (vaultId: VaultEntity['id']) => (
        <UnstakeBoostNotice vaultId={vaultId} boost={unstakeable} />
      );
    }

    if (balance && !balance.isZero()) {
      return (vaultId: VaultEntity['id']) => (
        <WithdrawBoostNotice vaultId={vaultId} balance={balance} />
      );
    }

    return undefined;
  }
);

/** Migrate has no zap withdraw form, so it keeps the link across to the boost tab */
const selectMigrateBoostNotice = createSelector(
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
  [TransactMode.Migrate]: [selectMigrateBoostNotice],
};

const selectFooter = (state: BeefyState) => {
  const mode = selectTransactMode(state);
  const footers = modeToFooters[mode];
  if (!footers) {
    return null;
  }

  const vaultId = selectTransactVaultId(state);
  for (const footer of footers) {
    const renderer = footer(state, vaultId);
    if (renderer) {
      return renderer(vaultId);
    }
  }

  return null;
};

export const FormStepFooter = memo(function FormStepFooter() {
  return useAppSelector(selectFooter);
});
