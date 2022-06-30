import { VaultEntity } from '../../../../../data/entities/vault';
import React, { memo, useMemo } from 'react';
import { connect } from 'react-redux';
import { BeefyState } from '../../../../../../redux-types';
import { selectIsVaultGov } from '../../../../../data/selectors/vaults';
import { formattedTotalApy } from '../../../../../../helpers/format';
import { VaultValueStat, VaultValueStatProps } from '../VaultValueStat';
import {
  selectVaultApyAvailable,
  selectVaultShouldShowInterest,
} from '../../../../../data/selectors/data-loader';
import {
  selectDidAPIReturnValuesForVault,
  selectVaultTotalApy,
} from '../../../../../data/selectors/apy';
import { selectIsVaultBoosted } from '../../../../../data/selectors/boosts';
import { AllValuesAsString } from '../../../../../data/utils/types-utils';
import { TotalApy } from '../../../../../data/reducers/apy';
import { useAppSelector } from '../../../../../../store';
import { InterestTooltipContent } from '../InterestTooltipContent';

export type VaultDailyStatProps = {
  vaultId: VaultEntity['id'];
};

export const VaultDailyStat = memo(connect(mapStateToProps)(VaultValueStat));

function mapStateToProps(state: BeefyState, { vaultId }: VaultDailyStatProps): VaultValueStatProps {
  const label = 'VaultStat-DAILY';

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
    value: isBoosted ? formatted.boostedTotalDaily : formatted.totalDaily,
    subValue: isBoosted ? formatted.totalDaily : null,
    blur: false,
    loading: !isLoaded,
    boosted: isBoosted,
    tooltip: <DailyContentTooltip vaultId={vaultId} isBoosted={isBoosted} rates={formatted} />,
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
