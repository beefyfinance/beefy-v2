import { css, type CssStyles } from '@repo/styles/css';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ChainEntity } from '../../../../features/data/entities/chain.ts';
import type { PromoEntity } from '../../../../features/data/entities/promo.ts';
import type { TokenEntity } from '../../../../features/data/entities/token.ts';
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
} from '../../../../features/data/entities/vault.ts';
import { selectPlatformById } from '../../../../features/data/selectors/platforms.ts';
import {
  selectActivePromoForVault,
  selectPromoById,
} from '../../../../features/data/selectors/promos.ts';
import { selectTokenByAddress } from '../../../../features/data/selectors/tokens.ts';
import {
  selectCowcentratedVaultById,
  selectVaultById,
} from '../../../../features/data/selectors/vaults.ts';
import { getBoostIconSrc } from '../../../../helpers/boostIconSrc.ts';
import { getIcon } from '../../../../helpers/iconSrc.ts';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { useIsOverflowingHorizontally } from '../../../../helpers/overflow.ts';
import { useAppSelector } from '../../../../features/data/store/hooks.ts';
import BoostIcon from '../../../../images/icons/boost.svg?react';
import { useBreakpoint } from '../../../MediaQueries/useBreakpoint.ts';
import { useMediaQuery } from '../../../MediaQueries/useMediaQuery.ts';
import { BasicTooltipContent } from '../../../Tooltip/BasicTooltipContent.tsx';
import { VaultPlatform } from '../../../VaultPlatform/VaultPlatform.tsx';
import { styles } from './styles.ts';
import { VaultTag, VaultTagWithTooltip } from './VaultTag.tsx';

const useStyles = legacyMakeStyles(styles);

type VaultPromoTagProps = {
  promoId: PromoEntity['id'];
  onlyIcon?: boolean;
};
const VaultPromoTag = memo(function VaultBoostTag({ promoId, onlyIcon }: VaultPromoTagProps) {
  const classes = useStyles();
  const promo = useAppSelector(state => selectPromoById(state, promoId));
  const { isOverflowing, ref } = useIsOverflowingHorizontally<HTMLDivElement>();
  const { tag } = promo;
  const iconSrc = useMemo(() => (tag.icon ? getBoostIconSrc(tag.icon) : undefined), [tag]);

  return (
    <VaultTagWithTooltip
      tooltip={<BasicTooltipContent title={tag.text} />}
      placement="bottom"
      disabled={!isOverflowing && !onlyIcon}
      css={styles.vaultTagBoost}
      ref={ref}
      order="text-icon"
      icon={
        iconSrc ?
          <img src={iconSrc} alt="" className={classes.vaultTagBoostIcon} width={12} height={12} />
        : <BoostIcon style={{ width: '12px', height: '12px' }} />
      }
      text={!onlyIcon && tag.text}
    />
  );
});

type VaultEarnTagProps = {
  chainId: ChainEntity['id'];
  earnedTokenAddress: TokenEntity['address'];
};
const VaultEarnTag = memo(function VaultEarnTag({
  chainId,
  earnedTokenAddress,
}: VaultEarnTagProps) {
  const { t } = useTranslation();
  const earnedToken = useAppSelector(state =>
    selectTokenByAddress(state, chainId, earnedTokenAddress)
  );

  return (
    <VaultTag
      css={styles.vaultTagEarn}
      text={t('VaultTag-EarnToken', { token: earnedToken.symbol })}
    />
  );
});

type VaultPlatformTagProps = {
  vaultId: VaultEntity['id'];
};
const VaultPlatformTag = memo(function VaultPlatformTag({ vaultId }: VaultPlatformTagProps) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const isGov = isGovVault(vault);
  const isCowcentratedLike = isCowcentratedLikeVault(vault);

  return (
    <VaultTag
      css={css.raw(isGov && styles.platformTagGov, isCowcentratedLike && styles.platformTagClm)}
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
  css: cssProp,
  onlyIcon,
}: {
  label: string;
  longLabel: string;
  fee: string;
  platformName: string;
  hideLabel?: boolean;
  hideFee?: boolean;
  css?: CssStyles;
  onlyIcon?: boolean;
}) {
  const classes = useStyles();
  // const tooltipTitle = useMemo(() => {
  //   return fee ? `${longLabel} | ${fee}` : longLabel;
  // }, [longLabel, fee]);

  return (
    <VaultTagWithTooltip
      order="text-icon"
      tooltip={
        <BasicTooltipContent title={longLabel} content={`${platformName} trading fee: ${fee}`} />
      }
      placement="bottom"
      css={css.raw(styles.vaultTagClm, cssProp)}
      icon={
        <img
          src={getIcon('clm')}
          height={12}
          width={12}
          className={classes.vaultTagClmIcon}
          alt={hideLabel ? label : undefined}
        />
      }
      text={
        !onlyIcon && (!hideLabel || (!hideFee && fee)) ?
          <>
            {!hideLabel && (
              <div
                className={css(
                  hideFee === undefined && hideLabel === undefined && styles.vaultTagClmTextAutoHide
                )}
              >
                {label}
              </div>
            )}
            {!hideFee && fee && (
              <>
                <div className={classes.divider} />
                <span>{fee}</span>
              </>
            )}
          </>
        : undefined
      }
    />
  );
});

const VaultClmPoolOrVaultTag = memo(function VaultClmPoolTag({
  vault,
  hideFee,
  hideLabel,
  css: cssProp,
  isPool,
  onlyIcon,
}: {
  vault: VaultGovCowcentrated | VaultStandardCowcentrated;
  isPool?: boolean;
  hideFee?: boolean;
  hideLabel?: boolean;
  css?: CssStyles;
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
      css={cssProp}
      onlyIcon={onlyIcon}
    />
  );
});

const VaultClmTag = memo(function VaultClmTag({
  vault,
  hideFee,
  hideLabel,
  css: cssProp,
  onlyIcon,
}: {
  vault: VaultCowcentrated;
  hideFee?: boolean;
  hideLabel?: boolean;
  css?: CssStyles;
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
      css={cssProp}
      onlyIcon={onlyIcon}
    />
  );
});

export const VaultClmLikeTag = memo(function VaultClmLikeTag({
  vault,
  hideFee,
  hideLabel,
  css: cssProp,
  onlyIcon,
}: {
  vault: VaultCowcentratedLike;
  hideFee?: boolean;
  hideLabel?: boolean;
  css?: CssStyles;
  onlyIcon?: boolean;
}) {
  if (isCowcentratedGovVault(vault)) {
    return (
      <VaultClmPoolOrVaultTag
        isPool={true}
        vault={vault}
        hideFee={true}
        hideLabel={hideLabel}
        css={cssProp}
        onlyIcon={onlyIcon}
      />
    );
  } else if (isCowcentratedStandardVault(vault)) {
    return (
      <VaultClmPoolOrVaultTag
        vault={vault}
        hideFee={true}
        hideLabel={hideLabel}
        css={cssProp}
        onlyIcon={onlyIcon}
      />
    );
  } else if (isCowcentratedVault(vault)) {
    return (
      <VaultClmTag
        vault={vault}
        hideFee={hideFee}
        hideLabel={hideLabel}
        css={cssProp}
        onlyIcon={onlyIcon}
      />
    );
  }

  return null;
});

const PointsTag = memo(function PointsTag() {
  const { t } = useTranslation();
  const { isOverflowing, ref } = useIsOverflowingHorizontally<HTMLDivElement>();
  return (
    <VaultTagWithTooltip
      tooltip={<BasicTooltipContent title={t('VaultTag-Points')} />}
      placement="bottom"
      disabled={!isOverflowing}
      css={styles.vaultTagPoints}
      ref={ref}
      text={t('VaultTag-Points')}
    />
  );
});

export type VaultTagsProps = {
  vaultId: VaultEntity['id'];
};
export const VaultTags = memo(function VaultTags({ vaultId }: VaultTagsProps) {
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const promo = useAppSelector(state => selectActivePromoForVault(state, vaultId));
  const isMobile = useBreakpoint({ to: 'xs' });
  const isGov = isGovVault(vault);
  const isCowcentratedLike = isCowcentratedLikeVault(vault);
  const isSmallDevice = useMediaQuery('(max-width: 450px)', false);
  const onlyShowIcon = isSmallDevice && isCowcentratedLike && !!promo;

  // Tag 1: Platform
  // Tag 2: CLM -> CLM Pool -> none
  // Tag 3: Retired -> Paused -> Promo -> none
  // Tag 4: Points -> none
  return (
    <div className={css(styles.vaultTags)}>
      <VaultPlatformTag vaultId={vaultId} />
      {isCowcentratedLike && (
        <VaultClmLikeTag
          vault={vault}
          hideFee={isMobile || !isVaultActive(vault)}
          hideLabel={isMobile}
          onlyIcon={onlyShowIcon}
        />
      )}
      {isVaultRetired(vault) ?
        <VaultTag css={styles.vaultTagRetired} text={t('VaultTag-Retired')} />
      : isVaultPaused(vault) ?
        <VaultTag css={styles.vaultTagPaused} text={t('VaultTag-Paused')} />
      : promo ?
        <VaultPromoTag onlyIcon={onlyShowIcon} promoId={promo.id} />
      : isGov && !isCowcentratedLike ?
        <VaultEarnTag chainId={vault.chainId} earnedTokenAddress={vault.earnedTokenAddresses[0]} /> // TODO support multiple earned tokens [empty = ok, not used when clm-like]
      : null}
      {isVaultEarningPoints(vault) && <PointsTag />}
    </div>
  );
});
