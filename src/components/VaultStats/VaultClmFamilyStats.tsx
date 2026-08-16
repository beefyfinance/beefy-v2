import { styled } from '@repo/styles/jsx';
import BigNumber from 'bignumber.js';
import { memo, useMemo } from 'react';
import { type TFunction, useTranslation } from 'react-i18next';
import { isVaultActive } from '../../features/data/entities/vault.ts';
import { type ApyVaultUIData, selectApyVaultUIData } from '../../features/data/selectors/apy.ts';
import { selectFilterAppliedAvgApySort } from '../../features/data/selectors/filtered-vaults.ts';
import { selectPlatformById } from '../../features/data/selectors/platforms.ts';
import type {
  TvlBreakdown,
  TvlBreakdownUnderlying,
} from '../../features/data/selectors/tvl-types.ts';
import {
  selectVaultDepositStatData,
  selectVaultTvlStatData,
  type VaultDepositStatData,
} from '../../features/data/selectors/vault-stats.ts';
import { type ClmFamilyRow, selectVaultById } from '../../features/data/selectors/vaults.ts';
import { useAppSelector } from '../../features/data/store/hooks.ts';
import type { AvgApySortType } from '../../features/data/reducers/filtered-vaults-types.ts';
import {
  formatAvgApy,
  formatLargeUsd,
  formatTokenDisplayCondensed,
  type FormattedTotalApy,
  formatTotalApy,
} from '../../helpers/format.ts';
import {
  ClmFamilyDepositTooltip,
  ClmFamilySideLine,
  ClmFamilyTvlTooltip,
  ClmTooltipSection,
  ClmTooltipSectionHeader,
  ClmTooltipSections,
} from './ClmFamilyShared.tsx';
import { VaultValueStat } from '../VaultValueStat/VaultValueStat.tsx';
import { ApyTooltipContent } from './ApyTooltipContent.tsx';

export type VaultClmFamilyStatsProps = {
  family: ClmFamilyRow;
};

export const VaultClmFamilyStats = memo(function VaultClmFamilyStats({
  family,
}: VaultClmFamilyStatsProps) {
  return (
    <Align>
      <Columns>
        <FamilyApyStat type="yearly" family={family} />
        <FamilyApyStat type="daily" family={family} />
        <FamilyTvlStat family={family} />
        <FamilyDepositStat family={family} />
      </Columns>
    </Align>
  );
});

type FamilyApyStatProps = {
  family: ClmFamilyRow;
  type: 'yearly' | 'daily';
};

function apySideValue(
  data: ApyVaultUIData,
  formatted: FormattedTotalApy | undefined,
  type: 'yearly' | 'daily',
  subSortApy: AvgApySortType,
  t: TFunction
): string {
  if (data.status !== 'available' || !formatted) {
    return data.status === 'hidden' ? '-' : '???';
  }
  const totalKey = type === 'daily' ? 'totalDaily' : 'totalApy';
  if (data.boosted === 'prestake') {
    return t('PRE-STAKE');
  }
  if (data.boosted === 'active') {
    const boostedTotalKey = type === 'daily' ? 'boostedTotalDaily' : 'boostedTotalApy';
    return formatted[boostedTotalKey] ?? formatted[totalKey];
  }
  if (subSortApy !== 'default' && type === 'yearly' && data.averages) {
    const period = formatAvgApy(data.averages).periods[subSortApy];
    if (period?.partial && period.formatted) {
      return period.formatted;
    }
  }
  return formatted[totalKey];
}

const FamilyApyStat = memo(function FamilyApyStat({ family, type }: FamilyApyStatProps) {
  const { t } = useTranslation();
  const vaultData = useAppSelector(state => selectApyVaultUIData(state, family.vaultId));
  const poolData = useAppSelector(state => selectApyVaultUIData(state, family.poolId));
  const subSortApy = useAppSelector(selectFilterAppliedAvgApySort);

  const label =
    type === 'daily' ? t('VaultStat-DAILY')
    : subSortApy !== 'default' ? t('VaultStat-AvgAPY', { count: subSortApy })
    : t('VaultStat-APY');

  const vaultFormatted = useMemo(
    () => (vaultData.status === 'available' ? formatTotalApy(vaultData.values, '???') : undefined),
    [vaultData]
  );
  const poolFormatted = useMemo(
    () => (poolData.status === 'available' ? formatTotalApy(poolData.values, '???') : undefined),
    [poolData]
  );

  if (vaultData.status === 'loading' || poolData.status === 'loading') {
    return (
      <VaultValueStat
        label={label}
        value="-"
        blur={false}
        loading={true}
        expectSubValue={true}
        altAlign="right"
        altFrom="lg"
      />
    );
  }

  // neither side earns (retired/paused family): a per-product split of "-" is meaningless
  if (vaultData.status === 'hidden' && poolData.status === 'hidden') {
    return (
      <VaultValueStat
        label={label}
        value="-"
        blur={false}
        loading={false}
        altAlign="right"
        altFrom="lg"
      />
    );
  }

  const vaultBoosted = vaultData.status === 'available' && !!vaultData.boosted;
  const poolBoosted = poolData.status === 'available' && !!poolData.boosted;

  return (
    <VaultValueStat
      label={label}
      value={
        <ClmFamilySideLine side="vault" boosted={vaultBoosted}>
          {apySideValue(vaultData, vaultFormatted, type, subSortApy, t)}
        </ClmFamilySideLine>
      }
      subValue={
        <ClmFamilySideLine side="pool" boosted={poolBoosted}>
          {apySideValue(poolData, poolFormatted, type, subSortApy, t)}
        </ClmFamilySideLine>
      }
      tooltip={
        vaultFormatted || poolFormatted ?
          <ClmTooltipSections>
            {vaultData.status === 'available' && vaultFormatted && (
              <ClmTooltipSection>
                <ClmTooltipSectionHeader>{t('VaultStat-ClmVault')}</ClmTooltipSectionHeader>
                <ApyTooltipContent
                  vaultId={family.vaultId}
                  type={type}
                  isBoosted={vaultBoosted}
                  rates={vaultFormatted}
                  averages={vaultData.averages ? formatAvgApy(vaultData.averages) : undefined}
                />
              </ClmTooltipSection>
            )}
            {poolData.status === 'available' && poolFormatted && (
              <ClmTooltipSection>
                <ClmTooltipSectionHeader>{t('VaultStat-ClmPool')}</ClmTooltipSectionHeader>
                <ApyTooltipContent
                  vaultId={family.poolId}
                  type={type}
                  isBoosted={poolBoosted}
                  rates={poolFormatted}
                  averages={poolData.averages ? formatAvgApy(poolData.averages) : undefined}
                />
              </ClmTooltipSection>
            )}
          </ClmTooltipSections>
        : undefined
      }
      blur={false}
      loading={false}
      altAlign="right"
      altFrom="lg"
    />
  );
});

type FamilyStatProps = {
  family: ClmFamilyRow;
};

function getUnderlyingBreakdown(
  breakdown: TvlBreakdown | undefined
): TvlBreakdownUnderlying | undefined {
  return breakdown !== undefined && 'underlyingTvl' in breakdown ? breakdown : undefined;
}

const FamilyTvlStat = memo(function FamilyTvlStat({ family }: FamilyStatProps) {
  const { t } = useTranslation();
  const vaultData = useAppSelector(state => selectVaultTvlStatData(state, family.vaultId));
  const poolData = useAppSelector(state => selectVaultTvlStatData(state, family.poolId));
  const vaultSide = useAppSelector(state => selectVaultById(state, family.vaultId));
  const underlying = getUnderlyingBreakdown(!vaultData.loading ? vaultData.breakdown : undefined);
  const underlyingPlatformId = underlying?.underlyingPlatformId;
  const underlyingPlatform = useAppSelector(state =>
    underlyingPlatformId ? selectPlatformById(state, underlyingPlatformId) : undefined
  );

  if (vaultData.loading || poolData.loading) {
    return (
      <VaultValueStat
        label={t('VaultStat-TVL')}
        value="-"
        blur={false}
        loading={true}
        expectSubValue={true}
        altAlign="right"
        altFrom="lg"
      />
    );
  }

  const vaultTvl = vaultData.breakdown.vaultTvl;
  const poolTvl = poolData.breakdown.vaultTvl;
  // the pool's tvl excludes an ACTIVE vault sibling's stake, so summing is exact then;
  // otherwise the pool figure still contains it — max avoids double counting
  const familyTvl =
    isVaultActive(vaultSide) ? vaultTvl.plus(poolTvl) : BigNumber.max(vaultTvl, poolTvl);
  const underlyingTvl = underlying?.underlyingTvl;

  return (
    <VaultValueStat
      label={t('VaultStat-TVL')}
      value={<ClmFamilySideLine side="vault">{formatLargeUsd(vaultTvl)}</ClmFamilySideLine>}
      subValue={<ClmFamilySideLine side="pool">{formatLargeUsd(poolTvl)}</ClmFamilySideLine>}
      tooltip={
        <ClmFamilyTvlTooltip
          vaultTvl={vaultTvl}
          poolTvl={poolTvl}
          familyTvl={familyTvl}
          underlyingTvl={underlyingTvl}
          platformName={underlyingPlatform?.name}
        />
      }
      blur={false}
      loading={false}
      altAlign="right"
      altFrom="lg"
    />
  );
});

function depositSideAmount(data: VaultDepositStatData): string {
  if (data.loading) {
    return '-';
  }
  if (!('depositToken' in data) || data.totalDeposit.isZero()) {
    return '0';
  }
  return formatTokenDisplayCondensed(data.totalDeposit, data.depositToken.decimals, 6);
}

function depositSideUsd(data: VaultDepositStatData): BigNumber | undefined {
  return !data.loading && 'totalDepositUsd' in data ? data.totalDepositUsd : undefined;
}

const FamilyDepositStat = memo(function FamilyDepositStat({ family }: FamilyStatProps) {
  const { t } = useTranslation();
  const vaultData = useAppSelector(state => selectVaultDepositStatData(state, family.vaultId));
  const poolData = useAppSelector(state => selectVaultDepositStatData(state, family.poolId));
  const blur = vaultData.hideBalance;

  if (vaultData.loading || poolData.loading) {
    return (
      <VaultValueStat
        label={t('VaultStat-DEPOSITED')}
        value="-"
        blur={blur}
        loading={true}
        expectSubValue={true}
        altAlign="right"
        altFrom="lg"
      />
    );
  }

  const vaultUsd = depositSideUsd(vaultData);
  const poolUsd = depositSideUsd(poolData);

  return (
    <VaultValueStat
      label={t('VaultStat-DEPOSITED')}
      value={<ClmFamilySideLine side="vault">{depositSideAmount(vaultData)}</ClmFamilySideLine>}
      subValue={<ClmFamilySideLine side="pool">{depositSideAmount(poolData)}</ClmFamilySideLine>}
      tooltip={
        vaultUsd || poolUsd ?
          <ClmFamilyDepositTooltip vaultUsd={vaultUsd} poolUsd={poolUsd} />
        : undefined
      }
      blur={blur}
      loading={false}
      altAlign="right"
      altFrom="lg"
    />
  );
});

const Align = styled('div', {
  base: {
    display: 'flex',
    flexGrow: '0',
    flexShrink: '0',
    flexDirection: 'column',
    justifyContent: 'center',
  },
});

const Columns = styled('div', {
  base: {
    display: 'grid',
    width: '100%',
    columnGap: '24px',
    rowGap: '24px',
    gridTemplateColumns: 'var(--vaults-list-grid-columns)',
  },
});
