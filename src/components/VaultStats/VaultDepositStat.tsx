import type { VaultEntity } from '../../features/data/entities/vault';
import { isGovVault, isStandardVault } from '../../features/data/entities/vault';
import { memo, type ReactNode } from 'react';
import { connect } from 'react-redux';
import type { BeefyState } from '../../redux-types';
import { selectVaultById } from '../../features/data/selectors/vaults';
import {
  selectGovVaultUserStakedBalanceInDepositToken,
  selectStandardVaultUserBalanceInDepositTokenExcludingBoostsBridged,
  selectStandardVaultUserBalanceInDepositTokenIncludingBoostsBridged,
  selectUserVaultDepositInUsd,
} from '../../features/data/selectors/balance';
import { formatBigDecimals, formatBigUsd } from '../../helpers/format';
import {
  selectIsBalanceHidden,
  selectIsWalletKnown,
  selectWalletAddress,
} from '../../features/data/selectors/wallet';
import { VaultValueStat } from '../VaultValueStat';
import { VaultDepositedTooltip } from '../VaultDepositedTooltip';

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
    state.ui.dataLoader.global.prices.alreadyLoadedOnce && selectIsWalletKnown(state)
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

  // deposit can be moo or oracle
  const deposit = isGovVault(vault)
    ? selectGovVaultUserStakedBalanceInDepositToken(state, vault.id)
    : selectStandardVaultUserBalanceInDepositTokenIncludingBoostsBridged(state, vault.id);

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

  const totalDeposited = formatBigDecimals(deposit, 8, false);
  const totalDepositedUsd = formatBigUsd(selectUserVaultDepositInUsd(state, vaultId));

  // if bridged, or boosted, add tooltip
  let tooltip: ReactNode | undefined;
  if (isStandardVault(vault)) {
    const onlyVaultDeposit = selectStandardVaultUserBalanceInDepositTokenExcludingBoostsBridged(
      state,
      vault.id
    );
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
