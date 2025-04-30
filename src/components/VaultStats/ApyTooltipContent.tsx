import { styled } from '@repo/styles/jsx';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { VaultEntity } from '../../features/data/entities/vault.ts';
import { selectVaultById } from '../../features/data/selectors/vaults.ts';
import {
  getApyComponents,
  getApyLabelsForType,
  getApyLabelsTypeForVault,
} from '../../helpers/apy.ts';
import { type FormattedAvgApy, type FormattedTotalApy } from '../../helpers/format.ts';
import { useAppSelector } from '../../store.ts';
import { InterestTooltipContent } from '../InterestTooltipContent/InterestTooltipContent.tsx';

type TotalApyTooltipContentProps = {
  vaultId: VaultEntity['id'];
  type: 'yearly' | 'daily';
  isBoosted: boolean;
  rates: FormattedTotalApy;
  title?: boolean;
};

const TotalApyTooltipContent = memo(function TotalApyTooltipContent({
  vaultId,
  type,
  isBoosted,
  rates,
  title = false,
}: TotalApyTooltipContentProps) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const rows = useMemo(() => {
    const labels = getApyLabelsForType(getApyLabelsTypeForVault(vault, rates.totalType));
    const allComponents = getApyComponents();
    const components = allComponents[type];
    const totalKey = type === 'daily' ? 'totalDaily' : 'totalApy';
    const boostedTotalKey = type === 'daily' ? 'boostedTotalDaily' : 'boostedTotalApy';

    const items: {
      label: string | string[];
      value: string;
    }[] = components
      .filter(key => key in rates)
      .map(key => ({
        label: labels[key],
        value: rates[key] ?? '?',
      }));

    items.push({
      label: labels[totalKey],
      value: isBoosted ? (rates[boostedTotalKey] ?? '?') : rates[totalKey],
    });

    return items;
  }, [vault, isBoosted, rates, type]);

  return (
    <>
      {title && <GroupHeader>Current</GroupHeader>}
      <InterestTooltipContent rows={rows} />
    </>
  );
});

type AverageApyTooltipContentProps = {
  vaultId: VaultEntity['id'];
  averages: FormattedAvgApy;
  title?: boolean;
};

export const AverageApyTooltipContent = memo(function AverageApyTooltipContent({
  vaultId,
  averages,
  title = false,
}: AverageApyTooltipContentProps) {
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  // TODO select total type from TotalApy
  const totalType = 'apy';

  const { rows, noteDays } = useMemo(() => {
    const labelType = getApyLabelsTypeForVault(vault, totalType);
    const items: {
      label: string | string[];
      value: string;
      labelTextParams?: Record<string, string>;
    }[] = [];

    let partialDays: number | undefined;

    for (const days of averages.partial) {
      const period = averages.periods[days];
      if (!period || !period.formatted) {
        break;
      }
      if (period.partial && !period.full) {
        partialDays = period.dataWholeDays;
      }
      items.push({
        label: [`Vault-Apy-${labelType}-Yearly-Avg`, `Vault-Apy-Yearly-Avg`],
        value: period.formatted,
        labelTextParams: { count: period.dataWholeDays.toString() },
      });
    }
    return {
      rows: items.length ? items : undefined,
      noteDays: items.length && partialDays !== undefined ? Math.max(1, partialDays) : undefined,
    };
  }, [vault, averages, totalType]);

  if (!rows) {
    return null;
  }

  return (
    <>
      {title && <GroupHeader>Historical</GroupHeader>}
      <InterestTooltipContent rows={rows} highLightLast={false} />
      {noteDays && (
        <GroupFooter>
          {t('Vault-Apy-Average-Warning', {
            count: noteDays,
            days: noteDays.toFixed(0),
          })}
        </GroupFooter>
      )}
    </>
  );
});

type ApyTooltipContentProps = {
  vaultId: VaultEntity['id'];
  type: 'yearly' | 'daily';
  isBoosted: boolean;
  rates: FormattedTotalApy;
  averages?: FormattedAvgApy;
};

export const ApyTooltipContent = memo(function ApyTooltipContent({
  vaultId,
  type,
  isBoosted,
  rates,
  averages,
}: ApyTooltipContentProps) {
  const showAverages = !!averages && type === 'yearly';

  return (
    <Groups>
      <div>
        <TotalApyTooltipContent
          vaultId={vaultId}
          type={type}
          isBoosted={isBoosted}
          rates={rates}
          title={showAverages}
        />
      </div>
      {showAverages && (
        <div>
          <AverageApyTooltipContent title={true} vaultId={vaultId} averages={averages} />
        </div>
      )}
    </Groups>
  );
});

const Groups = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
});

const GroupHeader = styled('div', {
  base: {
    textStyle: 'subline',
    color: 'colorPalette.text.title',
  },
});

const GroupFooter = styled('div', {
  base: {
    textStyle: 'body.sm',
    fontStyle: 'italic',
    maxWidth: '285px',
  },
});
