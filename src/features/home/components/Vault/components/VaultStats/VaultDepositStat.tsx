import { isGovVault, VaultEntity } from '../../../../../data/entities/vault';
import { memo } from 'react';
import { connect } from 'react-redux';
import { BeefyState } from '../../../../../../redux-types';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import {
  selectGovVaultUserStackedBalanceInDepositToken,
  selectStandardVaultUserBalanceInDepositTokenIncludingBoosts,
  selectUserVaultDepositInUsd,
} from '../../../../../data/selectors/balance';
import { formatBigDecimals, formatBigUsd } from '../../../../../../helpers/format';
import { selectIsBalanceHidden, selectIsWalletKnown } from '../../../../../data/selectors/wallet';
import { VaultValueStat } from '../VaultValueStat';

export type VaultDepositStatProps = {
  vaultId: VaultEntity['id'];
};

export const VaultDepositStat = memo(connect(mapStateToProps)(VaultValueStat));

function mapStateToProps(state: BeefyState, { vaultId }: VaultDepositStatProps) {
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
    };
  }

  // deposit can be moo or oracle
  const deposit = isGovVault(vault)
    ? selectGovVaultUserStackedBalanceInDepositToken(state, vault.id)
    : selectStandardVaultUserBalanceInDepositTokenIncludingBoosts(state, vault.id);

  if (!deposit.gt(0)) {
    return {
      label,
      value: '0',
      subValue: null,
      blur: hideBalance,
      loading: false,
    };
  }

  const totalDeposited = formatBigDecimals(deposit, 8, false);
  const totalDepositedUsd = formatBigUsd(selectUserVaultDepositInUsd(state, vault.id));

  return {
    label,
    value: totalDeposited,
    subValue: totalDepositedUsd,
    blur: hideBalance,
    loading: false,
  };
}
