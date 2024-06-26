import React, { memo, useMemo } from 'react';
import { makeStyles, type Theme, useMediaQuery } from '@material-ui/core';
import { styles } from './styles';
import { VaultTag, VaultTagWithTooltip } from './VaultTag';
import { useTranslation } from 'react-i18next';
import type { BoostEntity } from '../../../../features/data/entities/boost';
import { useAppSelector } from '../../../../store';
import {
  selectBoostById,
  selectPreStakeOrActiveBoostIds,
} from '../../../../features/data/selectors/boosts';
import { useIsOverflowingHorizontally } from '../../../../helpers/overflow';
import { BasicTooltipContent } from '../../../Tooltip/BasicTooltipContent';
import type { ChainEntity } from '../../../../features/data/entities/chain';
import type { TokenEntity } from '../../../../features/data/entities/token';
import { selectTokenByAddress } from '../../../../features/data/selectors/tokens';
import {
  isVaultActive,
  type VaultCowcentrated,
  type VaultEntity,
} from '../../../../features/data/entities/vault';
import {
  isCowcentratedVault,
  isGovVault,
  isVaultEarningPoints,
  isVaultPaused,
  isVaultRetired,
} from '../../../../features/data/entities/vault';
import { VaultPlatform } from '../../../VaultPlatform';
import {
  selectIsVaultCowcentrated,
  selectIsVaultGov,
  selectVaultById,
  selectVaultUnderlyingCowcentratedVaultOrUndefined,
} from '../../../../features/data/selectors/vaults';
import { getBoostIconSrc } from '../../../../helpers/boostIconSrc';
import clsx from 'clsx';
import { getIcon } from '../../../../helpers/iconSrc';

const useStyles = makeStyles(styles);

type VaultBoostTagProps = {
  boostId: BoostEntity['id'];
};
const VaultBoostTag = memo<VaultBoostTagProps>(function VaultBoostTag({ boostId }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const boost = useAppSelector(state => selectBoostById(state, boostId));
  const { isOverflowing, ref } = useIsOverflowingHorizontally();
  const { tagIcon, tagText, name } = boost;
  const iconSrc = useMemo(() => (tagIcon ? getBoostIconSrc(tagIcon) : undefined), [tagIcon]);

  return (
    <VaultTagWithTooltip
      content={<BasicTooltipContent title={t('VaultTag-PartnerBoost', { partner: name })} />}
      placement="bottom"
      disabled={!isOverflowing}
      className={classes.vaultTagBoost}
      ref={ref}
    >
      {iconSrc ? (
        <img src={iconSrc} alt="" className={classes.vaultTagBoostIcon} width={12} height={12} />
      ) : (
        <>{'\uD83D\uDD25 '}</>
      )}
      {tagText ? tagText : t('VaultTag-PartnerBoost', { partner: name })}
    </VaultTagWithTooltip>
  );
});

type VaultEarnTagProps = {
  chainId: ChainEntity['id'];
  earnedTokenAddress: TokenEntity['address'];
};
const VaultEarnTag = memo<VaultEarnTagProps>(function VaultBoostTag({
  chainId,
  earnedTokenAddress,
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const earnedToken = useAppSelector(state =>
    selectTokenByAddress(state, chainId, earnedTokenAddress)
  );

  return (
    <VaultTag className={classes.vaultTagEarn}>
      {t('VaultTag-EarnToken', { token: earnedToken.symbol })}
    </VaultTag>
  );
});

type VaultPlatformTagProps = {
  vaultId: VaultEntity['id'];
};
const VaultPlatformTag = memo<VaultPlatformTagProps>(function VaultPlatformTag({ vaultId }) {
  const classes = useStyles();
  const isGov = useAppSelector(state => selectIsVaultGov(state, vaultId));
  const isCowcentrated = useAppSelector(state => selectIsVaultCowcentrated(state, vaultId));

  return (
    <VaultTag
      className={clsx({
        [classes.platformTagGov]: isGov,
        [classes.platformTagClm]: isCowcentrated,
      })}
    >
      <VaultPlatform vaultId={vaultId} />
    </VaultTag>
  );
});

export const VaultClmTag = memo(function VaultClmTag({
  vault,
  hideFee,
  hideText,
  isPool = false,
}: {
  vault: VaultCowcentrated;
  hideFee?: boolean;
  hideText?: boolean;
  isPool?: boolean;
}) {
  const classes = useStyles();

  const isDynamic = useMemo(() => vault.feeTier === 'Dynamic', [vault.feeTier]);

  const tooltipContent = useMemo(() => {
    return isPool
      ? 'Cowcentrated Liquidity Manager Pool'
      : isDynamic
      ? `Cowcentrated Liquidity Manager | ${vault.feeTier}`
      : hideFee
      ? `Cowcentrated Liquidity Manager | ${vault.feeTier}%`
      : 'Cowcentrated Liquidity Manager';
  }, [hideFee, isDynamic, isPool, vault.feeTier]);

  const text = useMemo(() => {
    return isPool ? 'CLM Pool' : 'CLM';
  }, [isPool]);

  return (
    <VaultTagWithTooltip
      content={<BasicTooltipContent title={tooltipContent} />}
      placement="bottom"
      className={clsx(classes.vaultTagClm, {
        [classes.vaultTagClmAutoHide]: hideFee === undefined && hideText === undefined,
      })}
    >
      <img
        src={getIcon('clm')}
        height={16}
        width={16}
        className={classes.vaultTagClmIcon}
        alt={hideText ? 'CLM' : undefined}
      />
      {!hideText && <div className={classes.vaultTagClmText}>{text}</div>}
      {!hideFee && vault.feeTier && !isDynamic && (
        <>
          <div className={classes.divider} />
          <span>{`${vault.feeTier}%`}</span>
        </>
      )}
    </VaultTagWithTooltip>
  );
});

const PointsTag = memo(function PointsTag() {
  const classes = useStyles();
  const { t } = useTranslation();
  const { isOverflowing, ref } = useIsOverflowingHorizontally();
  return (
    <VaultTagWithTooltip
      content={<BasicTooltipContent title={t('VaultTag-Points')} />}
      placement="bottom"
      disabled={!isOverflowing}
      className={classes.vaultTagPoints}
      ref={ref}
    >
      {t('VaultTag-Points')}
    </VaultTagWithTooltip>
  );
});

export type VaultTagsProps = {
  vaultId: VaultEntity['id'];
};
export const VaultTags = memo<VaultTagsProps>(function VaultTags({ vaultId }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const boostIds = useAppSelector(state => selectPreStakeOrActiveBoostIds(state, vaultId));
  const boostId = boostIds.length ? boostIds[0] : null;
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'), { noSsr: true });
  const isGov = isGovVault(vault);
  const underlyingCLM = useAppSelector(state =>
    selectVaultUnderlyingCowcentratedVaultOrUndefined(state, vaultId)
  );

  // Tag 1: Platform
  // Tag 2: Retired -> Paused -> Boosted > Earnings
  // Tag 3: Points
  return (
    <div className={classes.vaultTags}>
      <VaultPlatformTag vaultId={vaultId} />
      {isCowcentratedVault(vault) && (
        <VaultClmTag
          vault={vault}
          hideFee={isMobile || !isVaultActive(vault)}
          hideText={isMobile}
        />
      )}
      {isVaultRetired(vault) ? (
        <VaultTag className={classes.vaultTagRetired}>{t('VaultTag-Retired')}</VaultTag>
      ) : isVaultPaused(vault) ? (
        <VaultTag className={classes.vaultTagPaused}>{t('VaultTag-Paused')}</VaultTag>
      ) : boostId ? (
        <VaultBoostTag boostId={boostId} />
      ) : underlyingCLM ? (
        <VaultClmTag vault={underlyingCLM} hideFee={true} isPool={true} />
      ) : isGov ? (
        <VaultEarnTag chainId={vault.chainId} earnedTokenAddress={vault.earnedTokenAddresses[0]} />
      ) : null}

      {isVaultEarningPoints(vault) && <PointsTag />}
    </div>
  );
});
