import { css } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';
import type BigNumber from 'bignumber.js';
import { memo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { BIG_ZERO } from '../../helpers/big-number.ts';
import { formatLargeUsd } from '../../helpers/format.ts';
import { getIcon } from '../../helpers/iconSrc.ts';
import AutocompoundIcon from '../../images/icons/autocompound.svg?react';
import { InterestTooltipContent } from '../InterestTooltipContent/InterestTooltipContent.tsx';

export type ClmFamilySide = 'vault' | 'pool';

/** one product's line in a dual-value stat cell; the icon is the visual identifier,
 * the sr-only label the accessible one */
export const ClmFamilySideLine = memo(function ClmFamilySideLine({
  side,
  active,
  boosted,
  children,
}: {
  side: ClmFamilySide;
  active?: boolean;
  boosted?: boolean;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <LineHolder active={active} boosted={boosted}>
      {side === 'vault' ?
        <AutocompoundIcon className={lineIconClass} />
      : <img src={getIcon('clm')} width={12} height={12} className={lineIconClass} alt="" />}
      <SrOnly>{t(side === 'vault' ? 'VaultStat-ClmVault' : 'VaultStat-ClmPool')}</SrOnly>
      {children}
    </LineHolder>
  );
});

const lineIconClass = css({
  width: '12px',
  height: '12px',
  flexShrink: '0',
});

const LineHolder = styled('div', {
  base: {
    display: 'inline-flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '4px',
  },
  variants: {
    active: {
      true: {
        color: 'text.lightest',
      },
      false: {
        color: 'text.dark',
      },
    },
    boosted: {
      true: {
        color: 'text.boosted',
      },
    },
  },
});

const SrOnly = styled('span', {
  base: {
    srOnly: true,
  },
});

export const ClmTooltipSections = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: '8px',
  },
});

export const ClmTooltipSection = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
  },
});

export const ClmTooltipSectionHeader = styled('div', {
  base: {
    textStyle: 'body.bold',
    color: 'colorPalette.text.title',
  },
});

export const ClmFamilyTvlTooltip = memo(function ClmFamilyTvlTooltip({
  vaultTvl,
  poolTvl,
  familyTvl,
  underlyingTvl,
  platformName,
}: {
  vaultTvl: BigNumber;
  poolTvl: BigNumber;
  familyTvl: BigNumber;
  underlyingTvl?: BigNumber;
  platformName?: string;
}) {
  const rows = [
    { label: 'Vault-Breakdown-Tvl-Vault-cowcentrated-standard', value: formatLargeUsd(vaultTvl) },
    { label: 'Vault-Breakdown-Tvl-Vault-cowcentrated-gov', value: formatLargeUsd(poolTvl) },
    { label: 'Vault-Breakdown-Tvl-Total-cowcentrated', value: formatLargeUsd(familyTvl) },
    ...(underlyingTvl ?
      [
        {
          label: 'Vault-Breakdown-Tvl-Underlying',
          value: formatLargeUsd(underlyingTvl),
          labelTextParams: { platform: platformName || 'Underlying' },
        },
      ]
    : []),
  ];
  return <InterestTooltipContent rows={rows} highLightLast={false} />;
});

export const ClmFamilyDepositTooltip = memo(function ClmFamilyDepositTooltip({
  vaultUsd,
  poolUsd,
}: {
  vaultUsd: BigNumber | undefined;
  poolUsd: BigNumber | undefined;
}) {
  const rows = [
    { label: 'VaultStat-ClmVault', value: formatLargeUsd(vaultUsd ?? BIG_ZERO) },
    { label: 'VaultStat-ClmPool', value: formatLargeUsd(poolUsd ?? BIG_ZERO) },
    {
      label: 'VaultStat-ClmFamily-Total',
      value: formatLargeUsd((vaultUsd ?? BIG_ZERO).plus(poolUsd ?? BIG_ZERO)),
    },
  ];
  return <InterestTooltipContent rows={rows} />;
});
