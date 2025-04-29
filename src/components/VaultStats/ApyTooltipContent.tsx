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
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const { current, average, averageNoteDays } = useMemo(() => {
    const labels = getApyLabelsForType(getApyLabelsTypeForVault(vault, rates.totalType));
    const allComponents = getApyComponents();
    const components = allComponents[type];
    const totalKey = type === 'daily' ? 'totalDaily' : 'totalApy';
    const boostedTotalKey = type === 'daily' ? 'boostedTotalDaily' : 'boostedTotalApy';

    const currentItems: {
      label: string | string[];
      value: string;
    }[] = components
      .filter(key => key in rates)
      .map(key => ({
        label: labels[key],
        value: rates[key] ?? '?',
      }));

    currentItems.push({
      label: labels[totalKey],
      value: isBoosted ? (rates[boostedTotalKey] ?? '?') : rates[totalKey],
    });

    const averageItems: {
      label: string | string[];
      value: string;
    }[] = [];
    let partialDays: number | undefined;
    if (averages && type === 'yearly') {
      const avgKeys = ['avg7d', 'avg30d', 'avg90d'] as const;
      for (const key of avgKeys) {
        const item = averages[key];
        if (!item || !item.formatted) {
          break;
        }
        averageItems.push({
          label: labels[key],
          value: item.formatted,
        });
        if (item.partial && !item.full) {
          partialDays = item.days;
        }
      }
    }

    return {
      current: currentItems.length ? currentItems : undefined,
      average: averageItems.length ? averageItems : undefined,
      averageNoteDays: averageItems.length && partialDays !== undefined ? partialDays : undefined,
    };
  }, [vault, isBoosted, rates, type, averages]);

  if (current === undefined && average === undefined) {
    return undefined;
  }

  return (
    <Groups>
      {current && (
        <div>
          <GroupHeader>Current</GroupHeader>
          <InterestTooltipContent rows={current} />
        </div>
      )}
      {average && (
        <div>
          <GroupHeader>Historical</GroupHeader>
          <InterestTooltipContent rows={average} highLightLast={false} />
          {averageNoteDays && (
            <GroupFooter>
              {t('Vault-Apy-Average-Warning', {
                count: averageNoteDays,
                days: averageNoteDays.toFixed(1),
              })}
            </GroupFooter>
          )}
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
