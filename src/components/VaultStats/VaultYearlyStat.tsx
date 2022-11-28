import { VaultEntity } from '../../features/data/entities/vault';
import React, { memo, useMemo } from 'react';
import { connect } from 'react-redux';
import { BeefyState } from '../../redux-types';
import { selectIsVaultGov } from '../../features/data/selectors/vaults';
import { formattedTotalApy } from '../../helpers/format';
import { VaultValueStat } from '../../features/home/components/Vault/components/VaultValueStat';
import {
  selectVaultApyAvailable,
  selectVaultShouldShowInterest,
} from '../../features/data/selectors/data-loader';
import {
  selectDidAPIReturnValuesForVault,
  selectVaultTotalApy,
} from '../../features/data/selectors/apy';
import {
  selectIsVaultBoosted,
  selectIsVaultPrestakedBoost,
} from '../../features/data/selectors/boosts';
import { useAppSelector } from '../../store';
import { InterestTooltipContent } from '../../features/home/components/Vault/components/InterestTooltipContent';
import { AllValuesAsString } from '../../features/data/utils/types-utils';
import { TotalApy } from '../../features/data/reducers/apy';

export type VaultYearlyStatProps = {
  vaultId: VaultEntity['id'];
};

export const VaultYearlyStat = memo(connect(mapStateToProps)(VaultValueStat));

function mapStateToProps(state: BeefyState, { vaultId }: VaultYearlyStatProps) {
  const isGovVault = selectIsVaultGov(state, vaultId);
  const label = isGovVault ? 'VaultStat-APR' : 'VaultStat-APY';

  const shouldShowInterest = selectVaultShouldShowInterest(state, vaultId);
  if (!shouldShowInterest) {
    return {
      label,
      value: '-',
      subValue: null,
      blur: false,
      loading: false,
    };
  }

  const isLoaded = selectVaultApyAvailable(state, vaultId);
  if (!isLoaded) {
    return {
      label,
      value: '-',
      subValue: null,
      blur: false,
      loading: true,
    };
  }

  const haveValues = selectDidAPIReturnValuesForVault(state, vaultId);
  if (!haveValues) {
    return {
      label,
      value: '???',
      subValue: null,
      blur: false,
      loading: false,
    };
  }

  const values = selectVaultTotalApy(state, vaultId);
  const formatted = formattedTotalApy(values, '???');
  const isBoosted = selectIsVaultBoosted(state, vaultId);
  const isPrestake = selectIsVaultPrestakedBoost(state, vaultId);

  return {
    label,
    value: isPrestake ? 'PRE-STAKE' : isBoosted ? formatted.boostedTotalApy : formatted.totalApy,
    subValue: isBoosted || isPrestake ? formatted.totalApy : null,
    blur: false,
    loading: !isLoaded,
    boosted: isBoosted || isPrestake,
    shouldTranslate: isPrestake,
    tooltip: <YearlyTooltipContent vaultId={vaultId} isBoosted={isBoosted} rates={formatted} />,
  };
}

type YearlyTooltipContentProps = {
  vaultId: VaultEntity['id'];
  isBoosted: boolean;
  rates: AllValuesAsString<TotalApy>;
};

const YearlyTooltipContent = memo<YearlyTooltipContentProps>(function YearlyTooltip({
  vaultId,
  isBoosted,
  rates,
}) {
  const isGovVault = useAppSelector(state => selectIsVaultGov(state, vaultId));
  const rows = useMemo(() => {
    const items = [];

    if (isGovVault) {
      items.push({
        label: 'Pool-Apr',
        value: rates.vaultApr,
      });
    } else {
      if ('vaultApr' in rates) {
        items.push({
          label: 'Vault-Breakdown-VaultApr',
          value: rates.vaultApr,
        });
      }

      if ('tradingApr' in rates) {
        items.push({
          label: 'Vault-Breakdown-TradingApr',
          value: rates.tradingApr,
        });
      }

      if ('liquidStakingApr' in rates) {
        items.push({
          label: 'Vault-Breakdown-LiquidStakingApr',
          value: rates.liquidStakingApr,
        });
      }

      if ('composablePoolApr' in rates) {
        items.push({
          label: 'Vault-Breakdown-ComposablePoolApr',
          value: rates.composablePoolApr,
        });
      }

      if ('boostApr' in rates) {
        items.push({
          label: 'Vault-Breakdown-BoostApr',
          value: rates.boostApr,
        });
      }

      items.push({
        label: 'APY',
        value: isBoosted ? rates.boostedTotalApy : rates.totalApy,
      });
    }

    return items.length ? items : null;
  }, [isGovVault, isBoosted, rates]);

  return <InterestTooltipContent rows={rows} />;
});
