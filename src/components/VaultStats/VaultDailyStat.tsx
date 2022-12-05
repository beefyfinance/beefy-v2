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
import { AllValuesAsString } from '../../features/data/utils/types-utils';
import { TotalApy } from '../../features/data/reducers/apy';
import { useAppSelector } from '../../store';
import { InterestTooltipContent } from '../../features/home/components/Vault/components/InterestTooltipContent';

export type VaultDailyStatProps = {
  vaultId: VaultEntity['id'];
  className?: string;
};

export const VaultDailyStat = memo(connect(mapStateToProps)(VaultValueStat));

function mapStateToProps(state: BeefyState, { vaultId, className }: VaultDailyStatProps) {
  const label = 'VaultStat-DAILY';

  const shouldShowInterest = selectVaultShouldShowInterest(state, vaultId);
  if (!shouldShowInterest) {
    return {
      label,
      value: '-',
      subValue: null,
      blur: false,
      loading: false,
      className: className ?? '',
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
      className: className ?? '',
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
      className: className ?? '',
    };
  }

  const values = selectVaultTotalApy(state, vaultId);
  const formatted = formattedTotalApy(values, '???');
  const isBoosted = selectIsVaultBoosted(state, vaultId);
  const isPrestake = selectIsVaultPrestakedBoost(state, vaultId);

  return {
    label,
    value: isPrestake
      ? 'PRE-STAKE'
      : isBoosted
      ? formatted.boostedTotalDaily
      : formatted.totalDaily,
    subValue: isBoosted || isPrestake ? formatted.totalDaily : null,
    blur: false,
    loading: !isLoaded,
    boosted: isBoosted || isPrestake,
    shouldTranslate: isPrestake,
    tooltip: <DailyContentTooltip vaultId={vaultId} isBoosted={isBoosted} rates={formatted} />,
    className: className ?? '',
  };
}

type DailyTooltipContentProps = {
  vaultId: VaultEntity['id'];
  isBoosted: boolean;
  rates: AllValuesAsString<TotalApy>;
  className?: string;
};

const DailyContentTooltip = memo<DailyTooltipContentProps>(function DailyTooltip({
  vaultId,
  isBoosted,
  rates,
}) {
  const isGovVault = useAppSelector(state => selectIsVaultGov(state, vaultId));
  const rows = useMemo(() => {
    const items = [];

    if (isGovVault) {
      items.push({
        label: 'Pool-AprDaily',
        value: rates.vaultDaily,
      });
    } else {
      if ('vaultDaily' in rates) {
        items.push({
          label: 'Vault-Breakdown-VaultDaily',
          value: rates.vaultDaily,
        });
      }

      if ('tradingDaily' in rates) {
        items.push({
          label: 'Vault-Breakdown-TradingDaily',
          value: rates.tradingDaily,
        });
      }

      if ('liquidStakingDaily' in rates) {
        items.push({
          label: 'Vault-Breakdown-LiquidStakingDaily',
          value: rates.liquidStakingDaily,
        });
      }

      if ('composablePoolDaily' in rates) {
        items.push({
          label: 'Vault-Breakdown-ComposablePoolDaily',
          value: rates.composablePoolDaily,
        });
      }

      if ('boostDaily' in rates) {
        items.push({
          label: 'Vault-Breakdown-BoostDaily',
          value: rates.boostDaily,
        });
      }

      items.push({
        label: 'Vault-Breakdown-DailyAPY',
        value: isBoosted ? rates.boostedTotalDaily : rates.totalDaily,
      });
    }

    return items.length ? items : null;
  }, [isGovVault, isBoosted, rates]);

  return <InterestTooltipContent rows={rows} />;
});
