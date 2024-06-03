import React, { memo, useMemo } from 'react';
import { makeStyles, useMediaQuery } from '@material-ui/core';
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
import type { VaultEntity } from '../../../../features/data/entities/vault';
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

export const CLMTag = memo(function CLMTag({
  vault,
  isMobile = false,
}: {
  vault: VaultEntity;
  isMobile?: boolean;
}) {
  const classes = useStyles();

  const tooltipContent = useMemo(() => {
    return isMobile
      ? `CLM | ${isCowcentratedVault(vault) && vault.feeTier}%`
      : 'Cowcentrated Liquidity Manager';
  }, [isMobile, vault]);

  return (
    <VaultTagWithTooltip
      content={<BasicTooltipContent title={tooltipContent} />}
      placement="bottom"
      className={classes.vaultTagClm}
    >
      <img src={getIcon('clm')} height={16} />
      <div className={classes.clm}>CLM</div>
      {!isMobile && isCowcentratedVault(vault) && vault.feeTier && (
        <>
          <div className={classes.divider} /> <span>{`${vault.feeTier}%`}</span>
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

  const isMobile = useMediaQuery('(max-width: 360px)', { noSsr: true });

  // Tag 1: Platform
  // Tag 2: Retired -> Paused -> Boosted > Earnings
  // Tag 3: Points
  return (
    <div className={classes.vaultTags}>
      <VaultPlatformTag vaultId={vaultId} />
      {isCowcentratedVault(vault) && <CLMTag isMobile={isMobile} vault={vault} />}
      {isVaultRetired(vault) ? (
        <VaultTag className={classes.vaultTagRetired}>{t('VaultTag-Retired')}</VaultTag>
      ) : isVaultPaused(vault) ? (
        <VaultTag className={classes.vaultTagPaused}>{t('VaultTag-Paused')}</VaultTag>
      ) : boostId ? (
        <VaultBoostTag boostId={boostId} />
      ) : isGovVault(vault) ? (
        <VaultEarnTag chainId={vault.chainId} earnedTokenAddress={vault.earnedTokenAddress} />
      ) : null}
      {isVaultEarningPoints(vault) && <PointsTag />}
    </div>
  );
});
