import { styled } from '@repo/styles/jsx';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { isCowcentratedLikeVault, type VaultEntity } from '../../features/data/entities/vault.ts';
import {
  selectClmBlendedDaily,
  selectClmRewardBreakdown,
} from '../../features/data/selectors/apy.ts';
import { selectVaultById } from '../../features/data/selectors/vaults.ts';
import {
  getApyComponents,
  getApyLabelsForVault,
  getApyLabelsTypeForVault,
} from '../../helpers/apy.ts';
import {
  formatLargePercent,
  type FormattedAvgApy,
  type FormattedTotalApy,
} from '../../helpers/format.ts';
import { useAppSelector } from '../../features/data/store/hooks.ts';
import { InterestTooltipContent } from '../InterestTooltipContent/InterestTooltipContent.tsx';

type TotalApyTooltipContentProps = {
  vaultId: VaultEntity['id'];
  type: 'yearly' | 'daily';
  isBoosted: boolean;
  rates: FormattedTotalApy;
  header?: boolean;
};

/** a CLM stream that exists but pays nothing right now; absent keys mean the same thing here */
const ZERO_RATE = '0%';

const TotalApyTooltipContent = memo(function TotalApyTooltipContent({
  vaultId,
  type,
  isBoosted,
  rates,
  header = false,
}: TotalApyTooltipContentProps) {
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  // the rows above describe the wrapper being shown, which is the autocompounding one wherever it
  // exists — so on a group with both, state what the other handling of the same position pays.
  // Named with the deposit control's own words, since that is the choice this describes.
  // Yearly only: the other side is a total rate, there is no daily figure for it.
  // per-stream split from the pool wrapper, scaled to what the shown wrapper pays
  const rewards = useAppSelector(state =>
    type === 'yearly' ? selectClmRewardBreakdown(state, vaultId) : undefined
  );
  // only when both wrappers are held, and only daily — see the selector for why not annualised
  const blendedDaily = useAppSelector(state =>
    type === 'yearly' ? selectClmBlendedDaily(state, vaultId) : undefined
  );
  const rows = useMemo(() => {
    const labels = getApyLabelsForVault(vault, rates.totalType);
    const allComponents = getApyComponents();
    const components = allComponents[type];
    const totalKey = type === 'daily' ? 'totalDaily' : 'totalApy';
    const boostedTotalKey = type === 'daily' ? 'boostedTotalDaily' : 'boostedTotalApy';
    const suffix = type === 'daily' ? 'Daily' : 'Apr';

    const items: {
      label: string | string[];
      value: string;
    }[] =
      isCowcentratedLikeVault(vault) ?
        // One template for every CLM. The rows are the income streams the product can draw on, so
        // they keep their order and their names whichever wrapper is being shown and whether or
        // not a stream currently pays — a component at zero reads 0%, it does not disappear.
        // The rewards row is one stream under two handlings: claimable on the pool wrapper,
        // already harvested and compounded on the vault one, so it never names either.
        ([
          {
            label: labels[`clm${suffix}`],
            value: rates[`clm${suffix}`] ?? ZERO_RATE,
          },
          {
            label: labels[`rewardPoolTrading${suffix}`],
            value:
              rewards ?
                formatLargePercent(rewards.rewardPoolTradingApr, 2)
              : (rates[`rewardPoolTrading${suffix}`] ?? rates[`vault${suffix}`] ?? ZERO_RATE),
          },
          {
            label: labels[`merkl${suffix}`],
            value:
              rewards ?
                formatLargePercent(rewards.merklApr, 2)
              : (rates[`merkl${suffix}`] ?? ZERO_RATE),
          },
        ] as { label: string | string[]; value: string }[])
      : components
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
  }, [vault, isBoosted, rates, type, rewards]);

  return (
    <InterestTooltipContent
      rows={rows}
      header={header ? 'Current' : undefined}
      footer={
        blendedDaily !== undefined ?
          <AlternativeRow highlight={true}>
            <span>{t('Vault-Apy-YourPositions')}</span>
            <span>{t('Vault-Apy-PerDay', { rate: formatLargePercent(blendedDaily, 4) })}</span>
          </AlternativeRow>
        : undefined
      }
    />
  );
});

/** the other wrapper's all-in rate, sat below the total rather than competing with the breakdown */
const AlternativeRow = styled('div', {
  base: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
  },
  variants: {
    highlight: {
      true: { color: 'text.light' },
    },
  },
});

type AverageApyTooltipContentProps = {
  vaultId: VaultEntity['id'];
  averages: FormattedAvgApy;
  totalType: 'apy' | 'apr';
  header?: boolean;
};

export const AverageApyTooltipContent = memo(function AverageApyTooltipContent({
  vaultId,
  averages,
  header = false,
  totalType,
}: AverageApyTooltipContentProps) {
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

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
        partialDays = period.dataDays;
      }
      items.push({
        label: [`Vault-Apy-${labelType}-Yearly-Avg`, `Vault-Apy-Yearly-Avg`],
        value: period.formatted,
        labelTextParams: { count: period.dataDays.toString() },
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
    <InterestTooltipContent
      rows={rows}
      highLightLast={false}
      header={header ? 'Historical' : undefined}
      footer={
        !!noteDays &&
        t('Vault-Apy-Average-Warning', {
          count: noteDays,
          days: noteDays.toFixed(0),
        })
      }
    />
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
    <Layout>
      <TotalApyTooltipContent
        vaultId={vaultId}
        type={type}
        isBoosted={isBoosted}
        rates={rates}
        header={showAverages}
      />
      {showAverages && (
        <AverageApyTooltipContent
          header={true}
          vaultId={vaultId}
          averages={averages}
          totalType={rates.totalType}
        />
      )}
    </Layout>
  );
});

/**
 * A merged CLM row shows the autocompounding side, so the composition above is that side's. Name it,
 * and give the claimable side's rate — the one number a user would otherwise have to go and find.
 */

const Layout = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
});
