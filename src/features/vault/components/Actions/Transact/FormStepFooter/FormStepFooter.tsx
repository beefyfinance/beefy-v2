import { createSelector } from '@reduxjs/toolkit';
import type BigNumber from 'bignumber.js';
import { lazy, memo } from 'react';
import { shallowEqual } from 'react-redux';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import type { PromoReward } from '../../../../../data/entities/promo.ts';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import { TransactMode } from '../../../../../data/reducers/wallet/transact-types.ts';
import {
  selectHasUserDepositInVault,
  selectUserVaultBalanceInDepositTokenInBoosts,
  selectUserVaultBalanceInShareTokenIncludingDisplaced,
  selectUserVaultBalanceNotInActiveBoostInShareToken,
} from '../../../../../data/selectors/balance.ts';
import { selectCurrentBoostByVaultIdOrUndefined } from '../../../../../data/selectors/boosts.ts';
import {
  selectVaultActiveExtraRewardTokens,
  type UnifiedRewardToken,
} from '../../../../../data/selectors/rewards.ts';
import {
  selectTransactMode,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact.ts';
import { bigNumberEqual } from '../../../../../data/utils/selector-equality.ts';
import type { BeefyState } from '../../../../../data/store/types.ts';

const BoostDepositNotice = lazy(() => import('./DepositBoostNotice.tsx'));
const DepositClaimNotice = lazy(() => import('./DepositClaimNotice.tsx'));
const WithdrawBoostNotice = lazy(() => import('./WithdrawBoostNotice.tsx'));

type FooterNotice =
  | {
      kind: 'boost-deposit';
      vaultId: VaultEntity['id'];
      rewardTokens: PromoReward[];
    }
  | {
      kind: 'deposit-claim';
      rewardTokens: UnifiedRewardToken[];
    }
  | {
      kind: 'withdraw-boost';
      vaultId: VaultEntity['id'];
      balance: BigNumber;
    };

const vaultIdArgument = (_state: BeefyState, vaultId: VaultEntity['id']) => vaultId;

const selectBoostDepositNotice = createSelector(
  [
    vaultIdArgument,
    selectCurrentBoostByVaultIdOrUndefined,
    selectUserVaultBalanceInShareTokenIncludingDisplaced,
    selectUserVaultBalanceNotInActiveBoostInShareToken,
  ],
  (vaultId, boost, inVaultAnywhere, notInActiveBoost): FooterNotice | undefined => {
    if (!!boost && (inVaultAnywhere.isZero() || !notInActiveBoost.isZero())) {
      return { kind: 'boost-deposit', vaultId, rewardTokens: boost.rewards };
    }

    return undefined;
  }
);

const selectDepositClaimNotice = createSelector(
  [selectHasUserDepositInVault, selectVaultActiveExtraRewardTokens],
  (deposited, tokens): FooterNotice | undefined => {
    if (!deposited && tokens && tokens.length) {
      return { kind: 'deposit-claim', rewardTokens: tokens };
    }

    return undefined;
  }
);

const selectWithdrawBoostNotice = createSelector(
  [vaultIdArgument, selectUserVaultBalanceInDepositTokenInBoosts],
  (vaultId, balance): FooterNotice | undefined => {
    if (balance && !balance.isZero()) {
      return { kind: 'withdraw-boost', vaultId, balance };
    }

    return undefined;
  }
);

type FooterSelector = (state: BeefyState, vaultId: VaultEntity['id']) => FooterNotice | undefined;

type ModeToFooters = {
  [K in TransactMode]?: FooterSelector[];
};

const modeToFooters: ModeToFooters = {
  [TransactMode.Deposit]: [selectBoostDepositNotice, selectDepositClaimNotice],
  [TransactMode.Withdraw]: [selectWithdrawBoostNotice],
  [TransactMode.Migrate]: [selectWithdrawBoostNotice],
};

const selectFooter = (state: BeefyState): FooterNotice | undefined => {
  const mode = selectTransactMode(state);
  const footers = modeToFooters[mode];
  if (!footers) {
    return undefined;
  }

  const vaultId = selectTransactVaultId(state);
  for (const footer of footers) {
    const notice = footer(state, vaultId);
    if (notice) {
      return notice;
    }
  }

  return undefined;
};

function rewardTokensEqual(a: UnifiedRewardToken[], b: UnifiedRewardToken[]): boolean {
  return a === b || (a.length === b.length && a.every((token, i) => shallowEqual(token, b[i])));
}

function footerNoticeEqual(a: FooterNotice | undefined, b: FooterNotice | undefined): boolean {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  if (a.kind === 'boost-deposit' && b.kind === 'boost-deposit') {
    return a.vaultId === b.vaultId && a.rewardTokens === b.rewardTokens;
  }
  if (a.kind === 'deposit-claim' && b.kind === 'deposit-claim') {
    return rewardTokensEqual(a.rewardTokens, b.rewardTokens);
  }
  if (a.kind === 'withdraw-boost' && b.kind === 'withdraw-boost') {
    return a.vaultId === b.vaultId && bigNumberEqual(a.balance, b.balance);
  }
  return false;
}

export const FormStepFooter = memo(function FormStepFooter() {
  const notice = useAppSelector(selectFooter, footerNoticeEqual);

  if (!notice) {
    return null;
  }

  switch (notice.kind) {
    case 'boost-deposit':
      return <BoostDepositNotice vaultId={notice.vaultId} rewardTokens={notice.rewardTokens} />;
    case 'deposit-claim':
      return <DepositClaimNotice rewardTokens={notice.rewardTokens} />;
    case 'withdraw-boost':
      return <WithdrawBoostNotice vaultId={notice.vaultId} balance={notice.balance} />;
  }
});
