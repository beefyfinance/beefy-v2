import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { isGovVault, VaultEntity } from '../../features/data/entities/vault';
import {
  selectGovVaultUserBalanceInMooToken,
  selectStandardVaultUserBalanceInOracleTokenIncludingBoosts,
} from '../../features/data/selectors/balance';
import { selectIsVaultBoosted } from '../../features/data/selectors/boosts';
import { selectVaultTvl } from '../../features/data/selectors/tvl';
import { selectVaultById } from '../../features/data/selectors/vaults';
import { BIG_ZERO, formatBigUsd } from '../../helpers/format';
import { BeefyState } from '../../redux-types';
import { ValueBlock } from '../ValueBlock/ValueBlock';

const _VaultTvl = connect(
  (
    state: BeefyState,
    { vaultId, variant }: { vaultId: VaultEntity['id']; variant: 'small' | 'large' }
  ) => {
    const vault = selectVaultById(state, vaultId);
    const tvlLoaded =
      state.ui.dataLoader.byChainId[vault.chainId]?.contractData.alreadyLoadedOnce &&
      state.ui.dataLoader.global.prices.alreadyLoadedOnce;
    const isBoosted = selectIsVaultBoosted(state, vaultId);
    const vaultTvl = tvlLoaded ? selectVaultTvl(state, vaultId) : BIG_ZERO;

    const totalDeposited = isGovVault(vault)
      ? selectGovVaultUserBalanceInMooToken(state, vault.id)
      : selectStandardVaultUserBalanceInOracleTokenIncludingBoosts(state, vault.id);

    return {
      isBoosted,
      vaultTvl: formatBigUsd(vaultTvl),
      hasDeposit: totalDeposited.isGreaterThan(0),
      loading: !tvlLoaded,
      variant,
    };
  }
)(
  ({
    vaultTvl,
    loading,
    variant,
  }: {
    isBoosted: boolean;
    vaultTvl: string;
    loading: boolean;
    variant: 'small' | 'large';
  }) => {
    const { t } = useTranslation();

    return (
      <ValueBlock
        label={t('TVL')}
        value={vaultTvl}
        blurred={false}
        loading={loading}
        usdValue={null}
        variant={variant}
      />
    );
  }
);
export const VaultTvl = React.memo(_VaultTvl);
