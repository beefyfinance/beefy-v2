import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { isGovVault, VaultEntity } from '../../features/data/entities/vault';
import {
  selectGovVaultUserStakedBalanceInDepositToken,
  selectStandardVaultUserBalanceInDepositTokenIncludingBoosts,
} from '../../features/data/selectors/balance';
import { selectIsVaultBoosted } from '../../features/data/selectors/boosts';
import { selectVaultTvl } from '../../features/data/selectors/tvl';
import { selectVaultById } from '../../features/data/selectors/vaults';
import { formatBigUsd } from '../../helpers/format';
import { BeefyState } from '../../redux-types';
import { ValueBlock } from '../ValueBlock/ValueBlock';
import { BIG_ZERO } from '../../helpers/big-number';

const _VaultTvl = connect((state: BeefyState, { vaultId }: { vaultId: VaultEntity['id'] }) => {
  const vault = selectVaultById(state, vaultId);
  const tvlLoaded =
    state.ui.dataLoader.byChainId[vault.chainId]?.contractData.alreadyLoadedOnce &&
    state.ui.dataLoader.global.prices.alreadyLoadedOnce;
  const isBoosted = selectIsVaultBoosted(state, vaultId);
  const vaultTvl = tvlLoaded ? selectVaultTvl(state, vaultId) : BIG_ZERO;

  const totalDeposited = isGovVault(vault)
    ? selectGovVaultUserStakedBalanceInDepositToken(state, vault.id)
    : selectStandardVaultUserBalanceInDepositTokenIncludingBoosts(state, vault.id);

  return {
    isBoosted,
    vaultTvl: formatBigUsd(vaultTvl),
    hasDeposit: totalDeposited.isGreaterThan(0),
    loading: !tvlLoaded,
  };
})(({ vaultTvl, loading }: { isBoosted: boolean; vaultTvl: string; loading: boolean }) => {
  const { t } = useTranslation();

  return (
    <ValueBlock
      label={t('TVL')}
      value={vaultTvl}
      blurred={false}
      loading={loading}
      usdValue={null}
    />
  );
});
export const VaultTvl = React.memo(_VaultTvl);
