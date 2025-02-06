import { memo, useMemo } from 'react';
import { makeStyles, type Theme, useMediaQuery } from '@material-ui/core';
import { styles } from './styles';
import { VaultTag, VaultTagWithTooltip } from './VaultTag';
import { useTranslation } from 'react-i18next';
import type { PromoEntity } from '../../../../features/data/entities/promo';
import { useAppSelector } from '../../../../store';
import { useIsOverflowingHorizontally } from '../../../../helpers/overflow';
import { BasicTooltipContent } from '../../../Tooltip/BasicTooltipContent';
import type { ChainEntity } from '../../../../features/data/entities/chain';
import type { TokenEntity } from '../../../../features/data/entities/token';
import { selectTokenByAddress } from '../../../../features/data/selectors/tokens';
import {
  isCowcentratedGovVault,
  isCowcentratedLikeVault,
  isCowcentratedStandardVault,
  isCowcentratedVault,
  isGovVault,
  isVaultActive,
  isVaultEarningPoints,
  isVaultPaused,
  isVaultRetired,
  type VaultCowcentrated,
  type VaultCowcentratedLike,
  type VaultEntity,
  type VaultGovCowcentrated,
  type VaultStandardCowcentrated,
} from '../../../../features/data/entities/vault';
import { VaultPlatform } from '../../../VaultPlatform';
import {
  selectCowcentratedVaultById,
  selectVaultById,
} from '../../../../features/data/selectors/vaults';
import { getBoostIconSrc } from '../../../../helpers/boostIconSrc';
import clsx from 'clsx';
import { getIcon } from '../../../../helpers/iconSrc';
import { selectPlatformById } from '../../../../features/data/selectors/platforms';
import {
  selectActivePromoForVault,
  selectPromoById,
} from '../../../../features/data/selectors/promos';

const useStyles = makeStyles(styles);

type VaultPromoTagProps = {
  promoId: PromoEntity['id'];
  onlyIcon?: boolean;
};

const VaultPromoTag = memo<VaultPromoTagProps>(function VaultPromoTag({ promoId, onlyIcon }) {
  const classes = useStyles();
  const promo = useAppSelector(state => selectPromoById(state, promoId));
  const { isOverflowing, ref } = useIsOverflowingHorizontally();
  const { tag } = promo;
  const iconSrc = useMemo(() => (tag.icon ? getBoostIconSrc(tag.icon) : undefined), [tag]);

  return (
    <VaultTagWithTooltip
      content={<BasicTooltipContent title={tag.text} />}
      placement="bottom"
      disabled={!isOverflowing && !onlyIcon}
      className={classes.vaultTagBoost}
      ref={ref}
      icon={
        iconSrc ? (
          <img src={iconSrc} alt="" className={classes.vaultTagBoostIcon} width={12} height={12} />
        ) : (
          <>{'\uD83D\uDD25'}</>
        )
      }
      text={!onlyIcon && tag.text}
    />
  );
});

type VaultEarnTagProps = {
  chainId: ChainEntity['id'];
  earnedTokenAddress: TokenEntity['address'];
};
const VaultEarnTag = memo<VaultEarnTagProps>(function VaultEarnTag({
  chainId,
  earnedTokenAddress,
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const earnedToken = useAppSelector(state =>
    selectTokenByAddress(state, chainId, earnedTokenAddress)
  );

  return (
    <VaultTag
      className={classes.vaultTagEarn}
      text={t('VaultTag-EarnToken', { token: earnedToken.symbol })}
    />
  );
});

type VaultPlatformTagProps = {
  vaultId: VaultEntity['id'];
};
const VaultPlatformTag = memo<VaultPlatformTagProps>(function VaultPlatformTag({ vaultId }) {
  const classes = useStyles();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const isGov = isGovVault(vault);
  const isCowcentratedLike = isCowcentratedLikeVault(vault);

  return (
    <VaultTag
      className={clsx({
        [classes.platformTagGov]: isGov,
        [classes.platformTagClm]: isCowcentratedLike,
      })}
      text={<VaultPlatform vaultId={vaultId} />}
    />
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
  onlyIcon,
}: {
  label: string;
  longLabel: string;
  fee: string;
  platformName: string;
  hideLabel?: boolean;
  hideFee?: boolean;
  className?: string;
  onlyIcon?: boolean;
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
      icon={
        <img
          src={getIcon('clm')}
          height={16}
          width={16}
          className={classes.vaultTagClmIcon}
          alt={hideLabel ? label : undefined}
        />
      }
      text={
        !onlyIcon && (!hideLabel || (!hideFee && fee)) ? (
          <>
            {!hideLabel && <div className={classes.vaultTagClmText}>{label}</div>}
            {!hideFee && fee && (
              <>
                <div className={classes.divider} />
                <span>{fee}</span>
              </>
            )}
          </>
        ) : undefined
      }
    />
  );
});

const VaultClmPoolOrVaultTag = memo(function VaultClmPoolTag({
  vault,
  hideFee,
  hideLabel,
  className,
  isPool,
  onlyIcon,
}: {
  vault: VaultGovCowcentrated | VaultStandardCowcentrated;
  isPool?: boolean;
  hideFee?: boolean;
  hideLabel?: boolean;
  className?: string;
  onlyIcon?: boolean;
}) {
  const cowcentratedVault = useAppSelector(state =>
    selectCowcentratedVaultById(state, vault.cowcentratedIds.clm)
  );
  const depositToken = useAppSelector(state =>
    selectTokenByAddress(state, cowcentratedVault.chainId, cowcentratedVault.depositTokenAddress)
  );
  const provider = useAppSelector(state =>
    depositToken?.providerId ? selectPlatformById(state, depositToken.providerId) : undefined
  );

  const typeLabel = isPool ? 'Pool' : 'Vault';

  const hasDynamicFee = cowcentratedVault?.feeTier === 'Dynamic';
  return (
    <BaseVaultClmTag
      label={`CLM ${typeLabel}`}
      fee={hasDynamicFee ? cowcentratedVault.feeTier : `${cowcentratedVault.feeTier}%`}
      longLabel={`Cowcentrated Liquidity Manager ${typeLabel}`}
      platformName={provider?.name || 'LP'}
      hideFee={hideFee}
      hideLabel={hideLabel}
      className={className}
      onlyIcon={onlyIcon}
    />
  );
});

const VaultClmTag = memo(function VaultClmTag({
  vault,
  hideFee,
  hideLabel,
  className,
  onlyIcon,
}: {
  vault: VaultCowcentrated;
  hideFee?: boolean;
  hideLabel?: boolean;
  className?: string;
  onlyIcon?: boolean;
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
      onlyIcon={onlyIcon}
    />
  );
});

export const VaultClmLikeTag = memo(function VaultClmLikeTag({
  vault,
  hideFee,
  hideLabel,
  className,
  onlyIcon,
}: {
  vault: VaultCowcentratedLike;
  hideFee?: boolean;
  hideLabel?: boolean;
  className?: string;
  onlyIcon?: boolean;
}) {
  if (isCowcentratedGovVault(vault)) {
    return (
      <VaultClmPoolOrVaultTag
        isPool={true}
        vault={vault}
        hideFee={true}
        hideLabel={hideLabel}
        className={className}
        onlyIcon={onlyIcon}
      />
    );
  } else if (isCowcentratedStandardVault(vault)) {
    return (
      <VaultClmPoolOrVaultTag
        vault={vault}
        hideFee={true}
        hideLabel={hideLabel}
        className={className}
        onlyIcon={onlyIcon}
      />
    );
  } else if (isCowcentratedVault(vault)) {
    return (
      <VaultClmTag
        vault={vault}
        hideFee={hideFee}
        hideLabel={hideLabel}
        className={className}
        onlyIcon={onlyIcon}
      />
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
      text={t('VaultTag-Points')}
    />
  );
});

export type VaultTagsProps = {
  vaultId: VaultEntity['id'];
};
export const VaultTags = memo<VaultTagsProps>(function VaultTags({ vaultId }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const promo = useAppSelector(state => selectActivePromoForVault(state, vaultId));
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('xs'), { noSsr: true });
  const isGov = isGovVault(vault);
  const isCowcentratedLike = isCowcentratedLikeVault(vault);
  const isSmallDevice = useMediaQuery('(max-width: 450px)', { noSsr: true });
  const onlyShowIcon = isSmallDevice && isCowcentratedLike && !!promo;

  // Tag 1: Platform
  // Tag 2: CLM -> CLM Pool -> none
  // Tag 3: Retired -> Paused -> Promo -> none
  // Tag 4: Points -> none
  return (
    <div className={clsx(classes.vaultTags)}>
      <VaultPlatformTag vaultId={vaultId} />
      {isCowcentratedLike && (
        <VaultClmLikeTag
          vault={vault}
          hideFee={isMobile || !isVaultActive(vault)}
          hideLabel={isMobile}
          onlyIcon={onlyShowIcon}
        />
      )}
      {isVaultRetired(vault) ? (
        <VaultTag className={classes.vaultTagRetired} text={t('VaultTag-Retired')} />
      ) : isVaultPaused(vault) ? (
        <VaultTag className={classes.vaultTagPaused} text={t('VaultTag-Paused')} />
      ) : promo ? (
        <VaultPromoTag onlyIcon={onlyShowIcon} promoId={promo.id} />
      ) : isGov && !isCowcentratedLike ? (
        <VaultEarnTag chainId={vault.chainId} earnedTokenAddress={vault.earnedTokenAddresses[0]} /> // TODO support multiple earned tokens [empty = ok, not used when clm-like]
      ) : null}
      {isVaultEarningPoints(vault) && <PointsTag />}
    </div>
  );
});
