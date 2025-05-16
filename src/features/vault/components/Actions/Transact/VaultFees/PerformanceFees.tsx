import type { VaultFee } from '../../../../../data/reducers/fees-types.ts';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatPercent } from '../../../../../../helpers/format.ts';
import { InterestTooltipContent } from '../../../../../../components/InterestTooltipContent/InterestTooltipContent.tsx';
import BigNumber from 'bignumber.js';
import { isFiniteNumber } from '../../../../../../helpers/number.ts';
import { entries } from '../../../../../../helpers/object.ts';

export type PerformanceFeesProps = {
  fees: VaultFee;
};

const performanceFeeLabels = {
  stakers: 'Transact-Fee-Holder',
  treasury: 'Transact-Fee-Treasury',
  strategist: 'Transact-Fee-Developers',
  call: 'Transact-Fee-HarvestFee',
  liquidity: 'Transact-Fee-Liquidity',
};

export const PerformanceFees = memo(function PerformanceFees({ fees }: PerformanceFeesProps) {
  const { t } = useTranslation();
  const rows = entries(performanceFeeLabels)
    .filter(([key]) => key in fees)
    .map(([key, label]) => ({
      label: t(label),
      value: `${
        isFiniteNumber(fees[key]) ? formatPercent(fees[key], 2, BigNumber.ROUND_HALF_CEIL) : '?'
      }`,
    }));

  rows.push({
    label: t('Transact-Fee-TotalFee'),
    value: `${
      isFiniteNumber(fees.total) ? formatPercent(fees.total, 2, BigNumber.ROUND_HALF_CEIL) : '?'
    }`,
  });

  return <InterestTooltipContent rows={rows} />;
});
