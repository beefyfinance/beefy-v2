import { VaultEntity } from '../../../../../data/entities/vault';
import React, { memo, useMemo } from 'react';
import { connect } from 'react-redux';
import { BeefyState } from '../../../../../../redux-types';
import { selectIsVaultGov } from '../../../../../data/selectors/vaults';
import { formattedTotalApy } from '../../../../../../helpers/format';
import { VaultValueStat } from '../VaultValueStat';
import {
  selectVaultApyAvailable,
  selectVaultShouldShowInterest,
} from '../../../../../data/selectors/data-loader';
import {
  selectDidAPIReturnValuesForVault,
  selectVaultTotalApy,
} from '../../../../../data/selectors/apy';
import { selectIsVaultBoosted } from '../../../../../data/selectors/boosts';
import { useAppSelector } from '../../../../../../store';
import { InterestTooltipContent } from '../InterestTooltipContent';
import { AllValuesAsString } from '../../../../../data/utils/types-utils';
import { TotalApy } from '../../../../../data/reducers/apy';

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

  return {
    label,
    value: isBoosted ? formatted.boostedTotalApy : formatted.totalApy,
    subValue: isBoosted ? formatted.totalApy : null,
    blur: false,
    loading: !isLoaded,
    boosted: isBoosted,
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
