import { memo, useMemo } from 'react';
import { LabeledStat } from '../LabeledStat/LabeledStat.tsx';
import { useTranslation } from 'react-i18next';
import { formatTotalApy } from '../../helpers/format.ts';
import { selectApyVaultUIData } from '../../features/data/selectors/apy.ts';
import type { VaultEntity } from '../../features/data/entities/vault.ts';
import { ValueBlock } from '../ValueBlock/ValueBlock.tsx';
import { useAppSelector } from '../../store.ts';
import { ApyTooltipContent } from '../VaultStats/VaultApyStat.tsx';

type ApyStatsProps = {
  vaultId: VaultEntity['id'];
  type: 'yearly' | 'daily';
};

export const ApyStats = memo(function ApyStats({ vaultId, type }: ApyStatsProps) {
  const { t } = useTranslation();
  const data = useAppSelector(state => selectApyVaultUIData(state, vaultId));
  const label = useMemo(
    () =>
      t(
        type === 'daily'
          ? 'VaultStat-DAILY'
          : data.type === 'apr'
            ? 'VaultStat-APR'
            : 'VaultStat-APY'
      ),
    [t, type, data.type]
  );
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

  return (
    <ValueBlock
      label={label}
      textContent={false}
      value={
        <LabeledStat
          boosted={
            data.boosted === 'prestake'
              ? t('PRE-STAKE')
              : data.boosted === 'active'
                ? formatted[boostedTotalKey]
                : undefined
          }
          value={formatted[totalKey]}
        />
      }
      tooltip={
        <ApyTooltipContent vaultId={vaultId} type={type} isBoosted={isBoosted} rates={formatted} />
      }
      loading={false}
    />
  );
});
