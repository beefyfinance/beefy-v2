import type { VaultFee } from '../../../../../data/reducers/fees';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatPercent } from '../../../../../../helpers/format';
import { InterestTooltipContent } from '../../../../../../components/InterestTooltipContent';
import { BigNumber } from 'bignumber.js';
import { isFiniteNumber } from '../../../../../../helpers/number';

export type PerformanceFeesProps = { fees: VaultFee };

const performanceFeeLabels = {
  stakers: 'Transact-Fee-Holder',
  treasury: 'Transact-Fee-Treasury',
  strategist: 'Transact-Fee-Developers',
  call: 'Transact-Fee-HarvestFee',
};
export const PerformanceFees = memo<PerformanceFeesProps>(function PerformanceFees({ fees }) {
  const { t } = useTranslation();
  const rows = Object.entries(performanceFeeLabels)
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
