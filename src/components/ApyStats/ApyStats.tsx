import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { VaultEntity } from '../../features/data/entities/vault.ts';
import { selectApyVaultUIData } from '../../features/data/selectors/apy.ts';
import { selectFilterAvgApySort } from '../../features/data/selectors/filtered-vaults.ts';
import { formatAvgApy, formatTotalApy } from '../../helpers/format.ts';
import { useAppSelector } from '../../features/data/store/hooks.ts';
import { ApyPeriodLabel } from '../ApyPeriodLabel/ApyPeriodLabel.tsx';
import { LabeledStat } from '../LabeledStat/LabeledStat.tsx';
import { ValueBlock } from '../ValueBlock/ValueBlock.tsx';
import { ApyTooltipContent } from '../VaultStats/ApyTooltipContent.tsx';

type ApyStatsProps = {
  vaultId: VaultEntity['id'];
  type: 'yearly' | 'daily';
};

export const ApyStats = memo(function ApyStats({ vaultId, type }: ApyStatsProps) {
  const { t } = useTranslation();
  const data = useAppSelector(state => selectApyVaultUIData(state, vaultId));
  const subSortApy = useAppSelector(selectFilterAvgApySort);
  const label =
    type === 'daily' ? t('VaultStat-DAILY')
    : data.status === 'hidden' ? t(data.type === 'apr' ? 'VaultStat-APR' : 'VaultStat-APY')
    : <ApyPeriodLabel type={data.type} />;
  const formatted = useMemo(
    () => (data.status === 'available' ? formatTotalApy(data.values, '???') : undefined),
    [data]
  );
  const totalKey = type === 'daily' ? 'totalDaily' : 'totalApy';
  const boostedTotalKey = type === 'daily' ? 'boostedTotalDaily' : 'boostedTotalApy';

  if (data.status === 'loading') {
    return <ValueBlock label={label} value="-" loading={true} />;
  }

  if (data.status !== 'available' || !formatted) {
    return (
      <ValueBlock label={label} value={data.status === 'hidden' ? '-' : '???'} loading={false} />
    );
  }

  const isBoosted = !!data.boosted;
  const averages = data.averages ? formatAvgApy(data.averages) : undefined;
  // falls back to current while a period has no data yet, same as the vault list
  const averagePercent =
    type === 'yearly' && subSortApy !== 'default' ?
      averages?.periods[subSortApy]?.formatted
    : undefined;

  return (
    <ValueBlock
      label={label}
      textContent={false}
      value={
        <LabeledStat
          boosted={
            data.boosted === 'prestake' ? t('PRE-STAKE')
            : data.boosted === 'active' ?
              formatted[boostedTotalKey]
            : undefined
          }
          value={averagePercent ?? formatted[totalKey]}
        />
      }
      tooltip={
        <ApyTooltipContent
          vaultId={vaultId}
          type={type}
          isBoosted={isBoosted}
          rates={formatted}
          averages={averages}
        />
      }
      loading={false}
    />
  );
});
