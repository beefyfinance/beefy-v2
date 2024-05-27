import type { VaultEntity } from '../../features/data/entities/vault';
import { isStandardVault } from '../../features/data/entities/vault';
import { memo, type ReactNode } from 'react';
import { connect } from 'react-redux';
import type { BeefyState } from '../../redux-types';
import { selectVaultById } from '../../features/data/selectors/vaults';
import {
  selectUserVaultBalanceInUsdIncludingBoostsBridged,
  selectUserVaultBalanceInDepositToken,
  selectUserVaultBalanceInDepositTokenIncludingBoostsBridged,
} from '../../features/data/selectors/balance';
import { formatLargeUsd, formatTokenDisplayCondensed } from '../../helpers/format';
import {
  selectIsBalanceHidden,
  selectIsWalletKnown,
  selectWalletAddress,
} from '../../features/data/selectors/wallet';
import { VaultValueStat } from '../VaultValueStat';
import { VaultDepositedTooltip } from '../VaultDepositedTooltip';
import { selectTokenByAddress } from '../../features/data/selectors/tokens';

export type VaultDepositStatProps = {
  vaultId: VaultEntity['id'];
  className?: string;
};

export const VaultDepositStat = memo(connect(mapStateToProps)(VaultValueStat));

function mapStateToProps(state: BeefyState, { vaultId, className }: VaultDepositStatProps) {
  const label = 'VaultStat-DEPOSITED';
  const vault = selectVaultById(state, vaultId);
  const hideBalance = selectIsBalanceHidden(state);
  const walletAddress = selectWalletAddress(state);

  const isLoaded =
    state.ui.dataLoader.global.prices.alreadyLoadedOnce &&
    selectIsWalletKnown(state) &&
    walletAddress
      ? state.ui.dataLoader.byAddress[walletAddress]?.byChainId[vault.chainId]?.balance
          .alreadyLoadedOnce
      : true;

  if (!isLoaded) {
    return {
      label,
      value: '-',
      subValue: null,
      blur: hideBalance,
      loading: true,
      className: className ?? '',
    };
  }

  const deposit = selectUserVaultBalanceInDepositTokenIncludingBoostsBridged(state, vault.id);

  if (!deposit.gt(0)) {
    return {
      label,
      value: '0',
      subValue: null,
      blur: hideBalance,
      loading: false,
      className: className ?? '',
    };
  }

  const depositToken = selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress);
  const totalDeposited = formatTokenDisplayCondensed(deposit, depositToken.decimals, 6);
  const totalDepositedUsd = formatLargeUsd(
    selectUserVaultBalanceInUsdIncludingBoostsBridged(state, vaultId)
  );

  // if bridged, or boosted, add tooltip
  let tooltip: ReactNode | undefined;
  if (isStandardVault(vault)) {
    const onlyVaultDeposit = selectUserVaultBalanceInDepositToken(state, vault.id);
    if (onlyVaultDeposit.lt(deposit)) {
      tooltip = <VaultDepositedTooltip vaultId={vault.id} />;
    }
  }

  return {
    label,
    value: totalDeposited,
    subValue: totalDepositedUsd,
    blur: hideBalance,
    loading: false,
    className: className ?? '',
    tooltip,
  };
}
