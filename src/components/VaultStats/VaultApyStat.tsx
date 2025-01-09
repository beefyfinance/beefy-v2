import { type VaultEntity } from '../../features/data/entities/vault';
import { memo, useMemo } from 'react';
import { selectVaultById } from '../../features/data/selectors/vaults';
import { type FormattedTotalApy, formatTotalApy } from '../../helpers/format';
import { VaultValueStat, type VaultValueStatProps } from '../VaultValueStat';
import { selectApyVaultUIData } from '../../features/data/selectors/apy';
import { useAppSelector } from '../../store';
import { InterestTooltipContent } from '../InterestTooltipContent';
import { getApyComponents, getApyLabelsForType, getApyLabelsTypeForVault } from '../../helpers/apy';
import { useTranslation } from 'react-i18next';

export type VaultApyStatProps = Omit<
  VaultValueStatProps,
  'label' | 'tooltip' | 'value' | 'subValue' | 'blur' | 'loading' | 'boosted'
> & {
  vaultId: VaultEntity['id'];
  type: 'yearly' | 'daily';
};

export const VaultApyStat = memo<VaultApyStatProps>(function VaultApyStat({
  vaultId,
  type,
  ...rest
}) {
  const { t } = useTranslation();
  const data = useAppSelector(state => selectApyVaultUIData(state, vaultId));
  const label =
    type === 'daily' ? 'VaultStat-DAILY' : data.type === 'apr' ? 'VaultStat-APR' : 'VaultStat-APY';
  const formatted = useMemo(
    () => (data.status === 'available' ? formatTotalApy(data.values, '???') : undefined),
    [data]
  );
  const totalKey = type === 'daily' ? 'totalDaily' : 'totalApy';
  const boostedTotalKey = type === 'daily' ? 'boostedTotalDaily' : 'boostedTotalApy';

  if (data.status == 'loading') {
    return <VaultValueStat label={label} value="-" blur={false} loading={true} {...rest} />;
  }

  if (data.status !== 'available' || !formatted) {
    return (
      <VaultValueStat
        label={label}
        value={data.status === 'hidden' ? '-' : '???'}
        blur={false}
        loading={false}
        {...rest}
      />
    );
  }

  const isBoosted = !!data.boosted;

  return (
    <VaultValueStat
      label={label}
      value={
        data.boosted === 'prestake'
          ? t('PRE-STAKE')
          : data.boosted === 'active'
          ? formatted[boostedTotalKey]
          : formatted[totalKey]
      }
      subValue={isBoosted ? formatted[totalKey] : undefined}
      tooltip={
        <ApyTooltipContent vaultId={vaultId} type={type} isBoosted={isBoosted} rates={formatted} />
      }
      blur={false}
      loading={false}
      boosted={isBoosted}
      {...rest}
    />
  );
});

type ApyTooltipContentProps = {
  vaultId: VaultEntity['id'];
  type: 'yearly' | 'daily';
  isBoosted: boolean;
  rates: FormattedTotalApy;
};

export const ApyTooltipContent = memo<ApyTooltipContentProps>(function ApyTooltipContent({
  vaultId,
  type,
  isBoosted,
  rates,
}) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const rows = useMemo(() => {
    const labels = getApyLabelsForType(getApyLabelsTypeForVault(vault, rates.totalType));
    const allComponents = getApyComponents();
    const components = allComponents[type];
    const totalKey = type === 'daily' ? 'totalDaily' : 'totalApy';
    const boostedTotalKey = type === 'daily' ? 'boostedTotalDaily' : 'boostedTotalApy';

    const items: { label: string | string[]; value: string; last?: boolean }[] = components
      .filter(key => key in rates)
      .map(key => ({
        label: labels[key],
        value: rates[key] ?? '?',
      }));

    items.push({
      label: labels[totalKey],
      value: isBoosted ? rates[boostedTotalKey] ?? '?' : rates[totalKey],
      last: true,
    });

    return items.length ? items : undefined;
  }, [vault, isBoosted, rates, type]);

  return rows ? <InterestTooltipContent rows={rows} /> : undefined;
});
