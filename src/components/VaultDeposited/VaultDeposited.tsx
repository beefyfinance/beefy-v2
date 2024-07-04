import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import type { VaultEntity } from '../../features/data/entities/vault';
import {
  selectUserVaultBalanceInDepositToken,
  selectUserVaultBalanceInDepositTokenIncludingBoostsBridgedWithToken,
  selectUserVaultBalanceInUsdIncludingBoostsBridged,
} from '../../features/data/selectors/balance';
import { selectVaultById } from '../../features/data/selectors/vaults';
import {
  selectIsBalanceHidden,
  selectIsWalletKnown,
  selectWalletAddress,
} from '../../features/data/selectors/wallet';
import { formatLargeUsd } from '../../helpers/format';
import type { BeefyState } from '../../redux-types';
import { ValueBlock } from '../ValueBlock/ValueBlock';
import type { TokenEntity } from '../../features/data/entities/token';
import type BigNumber from 'bignumber.js';
import { TokenAmountFromEntity } from '../TokenAmount';
import {
  selectIsAddressChainDataAvailable,
  selectIsGlobalDataAvailable,
} from '../../features/data/selectors/data-loader';
import { VaultDepositedTooltip } from '../VaultDepositedTooltip/VaultDepositedTooltip';

const _VaultDeposited = connect(
  (state: BeefyState, { vaultId }: { vaultId: VaultEntity['id'] }) => {
    const vault = selectVaultById(state, vaultId);
    const { amount: deposit, token: depositToken } =
      selectUserVaultBalanceInDepositTokenIncludingBoostsBridgedWithToken(state, vault.id);
    const baseDeposit = selectUserVaultBalanceInDepositToken(state, vault.id);
    const hasDeposit = deposit.gt(0);
    const depositUsd = formatLargeUsd(
      selectUserVaultBalanceInUsdIncludingBoostsBridged(state, vaultId)
    );
    const blurred = selectIsBalanceHidden(state);
    const walletAddress = selectWalletAddress(state);
    const isLoaded =
      selectIsGlobalDataAvailable(state, 'prices') && selectIsWalletKnown(state) && walletAddress
        ? selectIsAddressChainDataAvailable(state, walletAddress, vault.chainId, 'balance')
        : true;

    return {
      vaultId,
      hasDeposit,
      hasDisplacedDeposit: hasDeposit && deposit.gt(baseDeposit),
      deposit,
      depositUsd,
      depositToken,
      blurred,
      loading: !isLoaded,
    };
  }
)(
  ({
    vaultId,
    hasDeposit,
    hasDisplacedDeposit,
    deposit,
    depositUsd,
    depositToken,
    blurred,
    loading,
  }: {
    vaultId: VaultEntity['id'];
    hasDeposit: boolean;
    hasDisplacedDeposit: boolean;
    deposit: BigNumber;
    depositUsd: string;
    depositToken: TokenEntity;
    blurred: boolean;
    loading: boolean;
  }) => {
    const { t } = useTranslation();
    const tooltip = useMemo(
      () =>
        hasDisplacedDeposit
          ? {
              content: <VaultDepositedTooltip vaultId={vaultId} />,
            }
          : undefined,
      [hasDisplacedDeposit, vaultId]
    );

    return (
      <ValueBlock
        label={t('Vault-deposited')}
        value={<TokenAmountFromEntity amount={deposit} token={depositToken} />}
        usdValue={hasDeposit ? depositUsd : null}
        tooltip={tooltip}
        blurred={blurred}
        loading={loading}
      />
    );
  }
);

export const VaultDeposited = React.memo(_VaultDeposited);
