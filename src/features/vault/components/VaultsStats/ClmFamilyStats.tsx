import BigNumber from 'bignumber.js';
import { memo, useMemo } from 'react';
import { type TFunction, useTranslation } from 'react-i18next';
import { ValueBlock } from '../../../../components/ValueBlock/ValueBlock.tsx';
import { ApyTooltipContent } from '../../../../components/VaultStats/ApyTooltipContent.tsx';
import {
  ClmFamilyDepositTooltip,
  ClmFamilySideLine,
  ClmFamilyTvlTooltip,
} from '../../../../components/VaultStats/ClmFamilyShared.tsx';
import {
  formatLargeUsd,
  formatTokenDisplayCondensed,
  type FormattedTotalApy,
  formatTotalApy,
} from '../../../../helpers/format.ts';
import { useAppSelector } from '../../../data/store/hooks.ts';
import { isVaultActive, type VaultEntity } from '../../../data/entities/vault.ts';
import { type ApyVaultUIData, selectApyVaultUIData } from '../../../data/selectors/apy.ts';
import { selectPlatformById } from '../../../data/selectors/platforms.ts';
import {
  selectVaultDepositStatData,
  selectVaultTvlStatData,
  type VaultDepositStatData,
} from '../../../data/selectors/vault-stats.ts';
import { selectVaultById } from '../../../data/selectors/vaults.ts';

export type ClmFamilySides = {
  poolId: VaultEntity['id'];
  vaultId: VaultEntity['id'];
  activeSide: 'pool' | 'vault';
};

type FamilyStatProps = {
  family: ClmFamilySides;
};

function apySideText(
  data: ApyVaultUIData,
  formatted: FormattedTotalApy | undefined,
  type: 'yearly' | 'daily',
  t: TFunction
): string {
  if (data.status !== 'available' || !formatted) {
    return data.status === 'hidden' ? '-' : '???';
  }
  if (data.boosted === 'prestake') {
    return t('PRE-STAKE');
  }
  const totalKey = type === 'daily' ? 'totalDaily' : 'totalApy';
  if (data.boosted === 'active') {
    const boostedTotalKey = type === 'daily' ? 'boostedTotalDaily' : 'boostedTotalApy';
    return formatted[boostedTotalKey] ?? formatted[totalKey];
  }
  return formatted[totalKey];
}

export const FamilyApyStats = memo(function FamilyApyStats({
  family,
  type,
}: FamilyStatProps & { type: 'yearly' | 'daily' }) {
  const { t } = useTranslation();
  const vaultData = useAppSelector(state => selectApyVaultUIData(state, family.vaultId));
  const poolData = useAppSelector(state => selectApyVaultUIData(state, family.poolId));
  const activeData = family.activeSide === 'vault' ? vaultData : poolData;
  const activeId = family.activeSide === 'vault' ? family.vaultId : family.poolId;
  const label = t(
    type === 'daily' ? 'VaultStat-DAILY'
    : activeData.type === 'apr' ? 'VaultStat-APR'
    : 'VaultStat-APY'
  );

  const vaultFormatted = useMemo(
    () => (vaultData.status === 'available' ? formatTotalApy(vaultData.values, '???') : undefined),
    [vaultData]
  );
  const poolFormatted = useMemo(
    () => (poolData.status === 'available' ? formatTotalApy(poolData.values, '???') : undefined),
    [poolData]
  );

  if (vaultData.status === 'loading' || poolData.status === 'loading') {
    return <ValueBlock label={label} value="-" loading={true} />;
  }

  // neither side earns (retired/paused family): a per-product split of "-" is meaningless
  if (vaultData.status === 'hidden' && poolData.status === 'hidden') {
    return <ValueBlock label={label} value="-" loading={false} />;
  }

  const activeFormatted = family.activeSide === 'vault' ? vaultFormatted : poolFormatted;

  return (
    <ValueBlock
      label={label}
      textContent={false}
      value={
        <ClmFamilySideLine
          side="vault"
          active={family.activeSide === 'vault'}
          boosted={vaultData.status === 'available' && !!vaultData.boosted}
        >
          {apySideText(vaultData, vaultFormatted, type, t)}
        </ClmFamilySideLine>
      }
      usdValue={
        <ClmFamilySideLine side="pool" active={family.activeSide === 'pool'}>
          {apySideText(poolData, poolFormatted, type, t)}
        </ClmFamilySideLine>
      }
      tooltip={
        activeData.status === 'available' && activeFormatted ?
          <ApyTooltipContent
            vaultId={activeId}
            type={type}
            isBoosted={!!activeData.boosted}
            rates={activeFormatted}
          />
        : undefined
      }
      loading={false}
    />
  );
});

export const FamilyVaultTvl = memo(function FamilyVaultTvl({ family }: FamilyStatProps) {
  const { t } = useTranslation();
  const vaultData = useAppSelector(state => selectVaultTvlStatData(state, family.vaultId));
  const poolData = useAppSelector(state => selectVaultTvlStatData(state, family.poolId));
  const vaultSide = useAppSelector(state => selectVaultById(state, family.vaultId));
  const breakdown = !vaultData.loading ? vaultData.breakdown : undefined;
  const underlyingPlatformId =
    breakdown && 'underlyingPlatformId' in breakdown ?
      (breakdown.underlyingPlatformId as string | undefined)
    : undefined;
  const underlyingPlatform = useAppSelector(state =>
    underlyingPlatformId ? selectPlatformById(state, underlyingPlatformId) : undefined
  );

  if (vaultData.loading || poolData.loading) {
    return <ValueBlock label={t('VaultStat-TVL')} value="-" loading={true} />;
  }

  const vaultTvl = vaultData.breakdown.vaultTvl;
  const poolTvl = poolData.breakdown.vaultTvl;
  // the pool's tvl excludes an ACTIVE vault sibling's stake, so summing is exact then;
  // otherwise the pool figure still contains it — max avoids double counting
  const familyTvl =
    isVaultActive(vaultSide) ? vaultTvl.plus(poolTvl) : BigNumber.max(vaultTvl, poolTvl);
  const underlyingTvl =
    breakdown && 'underlyingTvl' in breakdown ?
      (breakdown.underlyingTvl as BigNumber | undefined)
    : undefined;

  return (
    <ValueBlock
      label={t('VaultStat-TVL')}
      textContent={false}
      value={
        <ClmFamilySideLine side="vault" active={family.activeSide === 'vault'}>
          {formatLargeUsd(vaultTvl)}
        </ClmFamilySideLine>
      }
      usdValue={
        <ClmFamilySideLine side="pool" active={family.activeSide === 'pool'}>
          {formatLargeUsd(poolTvl)}
        </ClmFamilySideLine>
      }
      tooltip={
        <ClmFamilyTvlTooltip
          vaultTvl={vaultTvl}
          poolTvl={poolTvl}
          familyTvl={familyTvl}
          underlyingTvl={underlyingTvl}
          platformName={underlyingPlatform?.name}
        />
      }
      loading={false}
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

export const FamilyVaultDeposited = memo(function FamilyVaultDeposited({
  family,
}: FamilyStatProps) {
  const { t } = useTranslation();
  const vaultData = useAppSelector(state => selectVaultDepositStatData(state, family.vaultId));
  const poolData = useAppSelector(state => selectVaultDepositStatData(state, family.poolId));
  const blurred = vaultData.hideBalance;

  if (vaultData.loading || poolData.loading) {
    return <ValueBlock label={t('Vault-deposited')} value="-" loading={true} blurred={blurred} />;
  }

  const vaultUsd = depositSideUsd(vaultData);
  const poolUsd = depositSideUsd(poolData);

  return (
    <ValueBlock
      label={t('Vault-deposited')}
      textContent={false}
      value={
        <ClmFamilySideLine side="vault" active={family.activeSide === 'vault'}>
          {depositSideAmount(vaultData)}
        </ClmFamilySideLine>
      }
      usdValue={
        <ClmFamilySideLine side="pool" active={family.activeSide === 'pool'}>
          {depositSideAmount(poolData)}
        </ClmFamilySideLine>
      }
      tooltip={
        vaultUsd || poolUsd ?
          <ClmFamilyDepositTooltip vaultUsd={vaultUsd} poolUsd={poolUsd} />
        : undefined
      }
      blurred={blurred}
      loading={false}
    />
  );
});
