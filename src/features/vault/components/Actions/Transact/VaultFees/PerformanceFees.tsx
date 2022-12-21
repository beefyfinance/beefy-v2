import { VaultFee } from '../../../../../data/reducers/fees';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { formatPercent } from '../../../../../../helpers/format';
import { InterestTooltipContent } from '../../../../../home/components/Vault/components/InterestTooltipContent';

export type PerformanceFeesProps = { fees: VaultFee };

const performanceFeeLabels = {
  stakers: 'Transact-Fee-Holder',
  treasury: 'Transact-Fee-Treasury',
  strategist: 'Transact-Fee-Developers',
  call: 'Transact-Fee-HarvestFee',
};
export const PerformanceFees = memo<PerformanceFeesProps>(function ({ fees }) {
  const { t } = useTranslation();
  const rows = Object.entries(performanceFeeLabels)
    .filter(([key]) => key in fees)
    .map(([key, label]) => ({
      label: t(label),
      value: `${formatPercent(fees[key], 2, '0%')}`,
    }));

  rows.push({
    label: t('Transact-Fee-TotalFee'),
    value: `${formatPercent(fees.total, 2, '0%')}`,
  });

  return <InterestTooltipContent rows={rows} />;
});
