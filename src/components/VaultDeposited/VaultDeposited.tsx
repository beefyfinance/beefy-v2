import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import type { VaultEntity } from '../../features/data/entities/vault';
import {
  selectHasUserBalanceInActiveBoost,
  selectUserVaultBalanceInUsdIncludingBoostsBridged,
  selectUserVaultBalanceInDepositTokenIncludingBoostsBridgedWithToken,
} from '../../features/data/selectors/balance';
import { selectIsVaultBoosted } from '../../features/data/selectors/boosts';
import { selectVaultById } from '../../features/data/selectors/vaults';
import {
  selectIsBalanceHidden,
  selectIsWalletKnown,
  selectWalletAddress,
} from '../../features/data/selectors/wallet';
import { formatLargeUsd } from '../../helpers/format';
import type { BeefyState } from '../../redux-types';
import { ValueBlock } from '../ValueBlock/ValueBlock';
import { useAppSelector } from '../../store';
import type { TokenEntity } from '../../features/data/entities/token';
import type BigNumber from 'bignumber.js';
import { TokenAmountFromEntity } from '../TokenAmount';

const _BoostedVaultDepositedLarge = connect(
  (state: BeefyState, { vaultId }: { vaultId: VaultEntity['id'] }) => {
    const vault = selectVaultById(state, vaultId);
    const { amount: deposit, token: depositToken } =
      selectUserVaultBalanceInDepositTokenIncludingBoostsBridgedWithToken(state, vault.id);
    const hasDeposit = deposit.gt(0);
    const depositUsd = formatLargeUsd(
      selectUserVaultBalanceInUsdIncludingBoostsBridged(state, vaultId)
    );
    const blurred = selectIsBalanceHidden(state);
    const walletAddress = selectWalletAddress(state);
    const isLoaded =
      state.ui.dataLoader.global.prices.alreadyLoadedOnce &&
      selectIsWalletKnown(state) &&
      walletAddress
        ? state.ui.dataLoader.byAddress[walletAddress]?.byChainId[vault.chainId]?.balance
            .alreadyLoadedOnce
        : true;
    return {
      hasDeposit,
      deposit,
      depositUsd,
      depositToken,
      blurred,
      loading: !isLoaded,
    };
  }
)(
  ({
    hasDeposit,
    deposit,
    depositUsd,
    depositToken,
    blurred,
    loading,
  }: {
    hasDeposit: boolean;
    deposit: BigNumber;
    depositUsd: string;
    depositToken: TokenEntity;
    blurred: boolean;
    loading: boolean;
  }) => {
    const { t } = useTranslation();

    return (
      <ValueBlock
        label={t('Vault-deposited')}
        value={<TokenAmountFromEntity amount={deposit} token={depositToken} />}
        usdValue={hasDeposit ? depositUsd : null}
        blurred={blurred}
        loading={loading}
      />
    );
  }
);
const BoostedVaultDepositedLarge = React.memo(_BoostedVaultDepositedLarge);

const _NonBoostedVaultDeposited = connect(
  (state: BeefyState, { vaultId }: { vaultId: VaultEntity['id'] }) => {
    const vault = selectVaultById(state, vaultId);
    const { amount: deposit, token: depositToken } =
      selectUserVaultBalanceInDepositTokenIncludingBoostsBridgedWithToken(state, vault.id);
    const hasDeposit = deposit.gt(0);
    const depositUsd = formatLargeUsd(
      selectUserVaultBalanceInUsdIncludingBoostsBridged(state, vaultId)
    );
    const blurred = selectIsBalanceHidden(state);
    const walletAddress = selectWalletAddress(state);
    const isLoaded =
      state.ui.dataLoader.global.prices.alreadyLoadedOnce &&
      selectIsWalletKnown(state) &&
      walletAddress
        ? state.ui.dataLoader.byAddress[walletAddress]?.byChainId[vault.chainId]?.balance
            .alreadyLoadedOnce
        : true;
    return {
      hasDeposit,
      deposit,
      depositUsd,
      depositToken,
      blurred,
      loading: !isLoaded,
    };
  }
)(
  ({
    hasDeposit,
    deposit,
    depositUsd,
    depositToken,
    blurred,
    loading,
  }: {
    hasDeposit: boolean;
    deposit: BigNumber;
    depositUsd: string;
    depositToken: TokenEntity;
    blurred: boolean;
    loading: boolean;
  }) => {
    const { t } = useTranslation();

    return (
      <ValueBlock
        label={t('Vault-deposited')}
        value={<TokenAmountFromEntity amount={deposit} token={depositToken} />}
        usdValue={hasDeposit ? depositUsd : null}
        blurred={blurred}
        loading={loading}
      />
    );
  }
);
const NonBoostedVaultDeposited = React.memo(_NonBoostedVaultDeposited);

const _VaultDeposited = ({ vaultId }: { vaultId: VaultEntity['id'] }) => {
  const isBoosted = useAppSelector((state: BeefyState) => selectIsVaultBoosted(state, vaultId));
  const userStaked = useAppSelector((state: BeefyState) =>
    selectHasUserBalanceInActiveBoost(state, vaultId)
  );

  return isBoosted && userStaked ? (
    <BoostedVaultDepositedLarge vaultId={vaultId} />
  ) : (
    <NonBoostedVaultDeposited vaultId={vaultId} />
  );
};
export const VaultDeposited = React.memo(_VaultDeposited);
