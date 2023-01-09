import { isGovVault, VaultEntity } from '../../features/data/entities/vault';
import { memo } from 'react';
import { connect } from 'react-redux';
import { BeefyState } from '../../redux-types';
import { selectVaultById } from '../../features/data/selectors/vaults';
import {
  selectGovVaultUserStakedBalanceInDepositToken,
  selectStandardVaultUserBalanceInDepositTokenIncludingBoosts,
  selectUserVaultDepositInUsd,
} from '../../features/data/selectors/balance';
import { formatBigDecimals, formatBigUsd } from '../../helpers/format';
import { selectIsBalanceHidden, selectIsWalletKnown } from '../../features/data/selectors/wallet';
import { VaultValueStat } from '../../features/home/components/Vault/components/VaultValueStat';

export type VaultDepositStatProps = {
  vaultId: VaultEntity['id'];
  className?: string;
};

export const VaultDepositStat = memo(connect(mapStateToProps)(VaultValueStat));

function mapStateToProps(state: BeefyState, { vaultId, className }: VaultDepositStatProps) {
  const label = 'VaultStat-DEPOSITED';
  const vault = selectVaultById(state, vaultId);
  const hideBalance = selectIsBalanceHidden(state);

  const isLoaded =
    state.ui.dataLoader.global.prices.alreadyLoadedOnce && selectIsWalletKnown(state)
      ? state.ui.dataLoader.byChainId[vault.chainId]?.balance.alreadyLoadedOnce
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
    : selectStandardVaultUserBalanceInDepositTokenIncludingBoosts(state, vault.id);

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

  return {
    label,
    value: totalDeposited,
    subValue: totalDepositedUsd,
    blur: hideBalance,
    loading: false,
    className: className ?? '',
  };
}
