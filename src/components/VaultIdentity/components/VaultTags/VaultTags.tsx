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
  isCowcentratedVault,
  isGovVault,
  isVaultActive,
  isVaultEarningPoints,
  isVaultPaused,
  isVaultRetired,
  type VaultCowcentrated,
  type VaultEntity,
  type VaultGov,
} from '../../../../features/data/entities/vault';
import { VaultPlatform } from '../../../VaultPlatform';
import {
  selectIsVaultCowcentratedLike,
  selectIsVaultGov,
  selectVaultById,
  selectVaultUnderlyingCowcentratedVaultOrUndefined,
} from '../../../../features/data/selectors/vaults';
import { getBoostIconSrc } from '../../../../helpers/boostIconSrc';
import clsx from 'clsx';
import { getIcon } from '../../../../helpers/iconSrc';
import { selectPlatformById } from '../../../../features/data/selectors/platforms';

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
  const isCowcentratedLike = useAppSelector(state => selectIsVaultCowcentratedLike(state, vaultId));

  return (
    <VaultTag
      className={clsx({
        [classes.platformTagGov]: isGov,
        [classes.platformTagClm]: isCowcentratedLike,
      })}
    >
      <VaultPlatform vaultId={vaultId} />
    </VaultTag>
  );
});

const BaseVaultClmTag = memo(function BaseVaultClmTag({
  label,
  longLabel,
  fee,
  platformName,
  hideLabel,
  hideFee,
  className,
}: {
  label: string;
  longLabel: string;
  fee: string;
  platformName: string;
  hideLabel?: boolean;
  hideFee?: boolean;
  className?: string;
}) {
  const classes = useStyles();
  // const tooltipTitle = useMemo(() => {
  //   return fee ? `${longLabel} | ${fee}` : longLabel;
  // }, [longLabel, fee]);

  return (
    <VaultTagWithTooltip
      content={
        <BasicTooltipContent title={longLabel} content={`${platformName} trading fee: ${fee}`} />
      }
      placement="bottom"
      triggerClass={className}
      className={clsx(classes.vaultTagClm, {
        [classes.vaultTagClmAutoHide]: hideFee === undefined && hideLabel === undefined,
      })}
    >
      <img
        src={getIcon('clm')}
        height={16}
        width={16}
        className={classes.vaultTagClmIcon}
        alt={hideLabel ? label : undefined}
      />
      {!hideLabel && <div className={classes.vaultTagClmText}>{label}</div>}
      {!hideFee && fee && (
        <>
          <div className={classes.divider} />
          <span>{fee}</span>
        </>
      )}
    </VaultTagWithTooltip>
  );
});

const VaultClmPoolTag = memo(function VaultClmPoolTag({
  vault,
  hideFee,
  hideLabel,
  className,
}: {
  vault: VaultGov;
  hideFee?: boolean;
  hideLabel?: boolean;
  className?: string;
}) {
  const underlyingVault = useAppSelector(state =>
    selectVaultUnderlyingCowcentratedVaultOrUndefined(state, vault.id)
  );
  const depositToken = useAppSelector(state =>
    underlyingVault
      ? selectTokenByAddress(state, underlyingVault.chainId, underlyingVault.depositTokenAddress)
      : undefined
  );
  const provider = useAppSelector(state =>
    depositToken?.providerId ? selectPlatformById(state, depositToken.providerId) : undefined
  );
  if (!underlyingVault) {
    return null;
  }

  const hasDynamicFee = underlyingVault?.feeTier === 'Dynamic';
  return (
    <BaseVaultClmTag
      label={'CLM Pool'}
      fee={hasDynamicFee ? underlyingVault.feeTier : `${underlyingVault.feeTier}%`}
      longLabel={'Cowcentrated Liquidity Manager Pool'}
      platformName={provider?.name || 'LP'}
      hideFee={hideFee}
      hideLabel={hideLabel}
      className={className}
    />
  );
});

const VaultClmTag = memo(function VaultClmTag({
  vault,
  hideFee,
  hideLabel,
  className,
}: {
  vault: VaultCowcentrated;
  hideFee?: boolean;
  hideLabel?: boolean;
  className?: string;
}) {
  const hasDynamicFee = vault.feeTier === 'Dynamic';
  const depositToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  const provider = useAppSelector(state =>
    depositToken.providerId ? selectPlatformById(state, depositToken.providerId) : undefined
  );

  return (
    <BaseVaultClmTag
      label={'CLM'}
      fee={hasDynamicFee ? vault.feeTier : `${vault.feeTier}%`}
      longLabel={'Cowcentrated Liquidity Manager'}
      platformName={provider?.name || 'LP'}
      hideFee={hideFee || hasDynamicFee}
      hideLabel={hideLabel}
      className={className}
    />
  );
});

export const VaultClmLikeTag = memo(function VaultClmLikeTag({
  vault,
  hideFee,
  hideLabel,
  className,
}: {
  vault: VaultEntity;
  hideFee?: boolean;
  hideLabel?: boolean;
  className?: string;
}) {
  if (isGovVault(vault)) {
    return (
      <VaultClmPoolTag vault={vault} hideFee={true} hideLabel={hideLabel} className={className} />
    );
  } else if (isCowcentratedVault(vault)) {
    return (
      <VaultClmTag vault={vault} hideFee={hideFee} hideLabel={hideLabel} className={className} />
    );
  }

  return null;
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
  const isCowcentratedLike = useAppSelector(state => selectIsVaultCowcentratedLike(state, vaultId));

  // Tag 1: Platform
  // Tag 2: CLM -> CLM Pool -> none
  // Tag 3: Retired -> Paused -> Boosted > Pool -> none
  // Tag 4: Points -> none
  return (
    <div className={classes.vaultTags}>
      <VaultPlatformTag vaultId={vaultId} />
      {isCowcentratedLike && (
        <VaultClmLikeTag
          vault={vault}
          hideFee={isMobile || !isVaultActive(vault)}
          hideLabel={isMobile}
        />
      )}
      {isVaultRetired(vault) ? (
        <VaultTag className={classes.vaultTagRetired}>{t('VaultTag-Retired')}</VaultTag>
      ) : isVaultPaused(vault) ? (
        <VaultTag className={classes.vaultTagPaused}>{t('VaultTag-Paused')}</VaultTag>
      ) : boostId ? (
        <VaultBoostTag boostId={boostId} />
      ) : isGov && !isCowcentratedLike ? (
        <VaultEarnTag chainId={vault.chainId} earnedTokenAddress={vault.earnedTokenAddresses[0]} /> // TODO support multiple earned tokens
      ) : null}
      {isVaultEarningPoints(vault) && <PointsTag />}
    </div>
  );
});
