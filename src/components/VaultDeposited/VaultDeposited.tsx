import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import type { VaultEntity } from '../../features/data/entities/vault.ts';
import {
  selectUserVaultBalanceInDepositToken,
  selectUserVaultBalanceInDepositTokenIncludingDisplacedWithToken,
  selectUserVaultBalanceInUsdIncludingDisplaced,
} from '../../features/data/selectors/balance.ts';
import { selectVaultById } from '../../features/data/selectors/vaults.ts';
import {
  selectIsBalanceHidden,
  selectWalletAddress,
} from '../../features/data/selectors/wallet.ts';
import { formatLargeUsd } from '../../helpers/format.ts';
import type { BeefyState } from '../../redux-types.ts';
import { ValueBlock } from '../ValueBlock/ValueBlock.tsx';
import type { TokenEntity } from '../../features/data/entities/token.ts';
import { type BigNumber } from 'bignumber.js';
import { TokenAmountFromEntity } from '../TokenAmount/TokenAmount.tsx';
import { VaultDepositedTooltip } from '../VaultDepositedTooltip/VaultDepositedTooltip.tsx';
import {
  selectIsBalanceAvailableForChainUser,
  selectIsPricesAvailable,
} from '../../features/data/selectors/data-loader.ts';
import { memo } from 'react';

const _VaultDeposited = connect(
  (
    state: BeefyState,
    {
      vaultId,
    }: {
      vaultId: VaultEntity['id'];
    }
  ) => {
    const vault = selectVaultById(state, vaultId);
    const walletAddress = selectWalletAddress(state);
    const isLoaded =
      !!walletAddress &&
      selectIsPricesAvailable(state) &&
      selectIsBalanceAvailableForChainUser(state, vault.chainId, walletAddress);

    const { amount: deposit, token: depositToken } =
      selectUserVaultBalanceInDepositTokenIncludingDisplacedWithToken(state, vault.id);
    const baseDeposit = selectUserVaultBalanceInDepositToken(state, vault.id);
    const hasDeposit = deposit.gt(0);
    const depositUsd = formatLargeUsd(
      selectUserVaultBalanceInUsdIncludingDisplaced(state, vaultId)
    );
    const blurred = selectIsBalanceHidden(state);

    return {
      vaultId,
      hasDeposit,
      hasDisplacedDeposit: hasDeposit && deposit.gt(baseDeposit),
      deposit,
      depositUsd,
      depositToken,
      blurred,
      loading: !!walletAddress && !isLoaded,
    };
  }
)(({
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

  return (
    <ValueBlock
      label={t('Vault-deposited')}
      value={<TokenAmountFromEntity amount={deposit} token={depositToken} />}
      usdValue={hasDeposit ? depositUsd : null}
      tooltip={hasDisplacedDeposit ? <VaultDepositedTooltip vaultId={vaultId} /> : undefined}
      blurred={blurred}
      loading={loading}
    />
  );
});

export const VaultDeposited = memo(_VaultDeposited);
