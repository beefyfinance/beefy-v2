import { ReactNode } from 'react';
import BigNumber from 'bignumber.js';
import { Grid, makeStyles, Typography, useMediaQuery, Box, Hidden } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { connect, useSelector } from 'react-redux';
import { AssetsImage } from '../../../../components/AssetsImage';
import { SafetyScore } from '../../../../components/SafetyScore';
import { DisplayTags } from '../../../../components/vaultTags';
import { Popover } from '../../../../components/Popover';
import { formatBigUsd, formatBigDecimals, byDecimals } from '../../../../helpers/format';
import { styles } from './styles';
import clsx from 'clsx';
import { ApyStats } from '../ApyStats';
import { ApyStatLoader } from '../../../../components/ApyStatLoader';
import {
  selectActiveVaultBoostIds,
  selectBoostById,
  selectIsVaultBoosted,
} from '../../../data/selectors/boosts';
import {
  isGovVault,
  isVaultActive,
  VaultEntity,
  VaultGov,
  VaultStandard,
} from '../../../data/entities/vault';
import { BeefyState } from '../../../../redux-types';
import { selectVaultTvl } from '../../../data/selectors/tvl';
import {
  selectGovVaultPendingRewardsInToken,
  selectGovVaultPendingRewardsInUsd,
  selectHasGovVaultPendingRewards,
  selectHasUserDepositInVault,
  selectUserVaultDepositInToken,
  selectUserVaultDepositInUsd,
  selectWalletBalanceOfToken,
} from '../../../data/selectors/balance';
import { selectIsBalanceHidden } from '../../../data/selectors/wallet';
import { selectChainById } from '../../../data/selectors/chains';
import { selectPlatformById } from '../../../data/selectors/platforms';
import { selectTokenById, selectTokenPriceByTokenId } from '../../../data/selectors/tokens';
import { selectVaultById } from '../../../data/selectors/vaults';
import { ChainEntity } from '../../../data/entities/chain';
import { PlatformEntity } from '../../../data/entities/platform';
import { TokenEntity } from '../../../data/entities/token';

function ValueText({
  vaultId,
  value,
  blurred = false,
}: {
  vaultId: VaultEntity['id'];
  value: ReactNode | null;
  blurred?: boolean;
}) {
  const classes = useItemStyles(vaultId);
  return (
    <>
      {value ? (
        <span
          className={clsx({
            [classes.value]: true,
            [classes.blurred]: blurred,
          })}
        >
          {blurred ? '$100' : value}
        </span>
      ) : (
        <ApyStatLoader />
      )}
    </>
  );
}

function ValuePrice({
  vaultId,
  value,
  blurred = false,
}: {
  vaultId: VaultEntity['id'];
  value: ReactNode | null;
  blurred?: boolean;
}) {
  const classes = useItemStyles(vaultId);
  return (
    <>
      {value ? (
        <span
          className={clsx({
            [classes.price]: true,
            [classes.blurred]: blurred,
          })}
        >
          {blurred ? '$100' : value}
        </span>
      ) : (
        <ApyStatLoader />
      )}
    </>
  );
}

const ItemTvl = connect((state: BeefyState, { vaultId }: { vaultId: VaultEntity['id'] }) => {
  const vault = selectVaultById(state, vaultId);
  const isBoosted = selectIsVaultBoosted(state, vaultId);
  const vaultTvl = selectVaultTvl(state, vaultId);
  const totalDeposited = selectUserVaultDepositInToken(state, vaultId);
  return { vault, isBoosted, vaultTvl, totalDeposited };
})(
  ({
    vault,
    isBoosted,
    vaultTvl,
    totalDeposited,
  }: {
    vault: VaultEntity;
    isBoosted: boolean;
    vaultTvl: BigNumber;
    totalDeposited: BigNumber;
  }) => {
    const isTwoColumns = useIsTwoColumns();
    const { t } = useTranslation();
    const classes = useItemStyles(vault.id);

    return (
      <Link className={classes.removeLinkStyles} to={`/${vault.chainId}/vault/${vault.id}`}>
        <div className={isGovVault || isBoosted ? classes.stat1 : classes.stat}>
          <Typography className={classes.label}>{t('TVL')}</Typography>
          <Typography className={classes.value}>{formatBigUsd(vaultTvl)}</Typography>
          {isBoosted ||
          (totalDeposited.isGreaterThan(0) && !isTwoColumns) ||
          (totalDeposited.isGreaterThan(0) && !isTwoColumns) ? (
            <div className={classes.boostSpacer} />
          ) : null}
        </div>
      </Link>
    );
  }
);

const ItemDeposited = connect((state: BeefyState, { vaultId }: { vaultId: VaultEntity['id'] }) => {
  const vault = selectVaultById(state, vaultId);
  const isBoosted = selectIsVaultBoosted(state, vault.id);
  const stakedIds = selectActiveVaultBoostIds(state, vault.id).map(boostId => {
    const boost = selectBoostById(state, boostId);
    return boost.name;
  });
  const userStaked = selectHasUserDepositInVault(state, vault.id);
  const totalDeposited = selectUserVaultDepositInToken(state, vault.id);
  const totalDepositedUsd = selectUserVaultDepositInUsd(state, vault.id);
  const blurred = selectIsBalanceHidden(state);
  return { vault, stakedIds, isBoosted, userStaked, totalDeposited, totalDepositedUsd, blurred };
})(
  ({
    vault,
    stakedIds,
    isBoosted,
    userStaked,
    totalDeposited,
    totalDepositedUsd,
    blurred,
  }: {
    vault: VaultEntity;
    stakedIds: string[];
    isBoosted: boolean;
    userStaked: boolean;
    totalDeposited: BigNumber;
    totalDepositedUsd: BigNumber;
    blurred: boolean;
  }) => {
    const classes = useItemStyles(vault.id);
    const { t } = useTranslation();

    return (
      <>
        <Link className={classes.removeLinkStyles} to={`/${vault.chainId}/vault/${vault.id}`}>
          {/*Boosted by */}
          {isBoosted && userStaked && (
            <div className={clsx([classes.stat, classes.marginBottom])}>
              <Typography className={classes.label}>{t('STAKED-IN')}</Typography>
              <ValueText value={stakedIds.join(', ')} vaultId={vault.id} />
              <Typography className={classes.label}>
                <ValuePrice value={t('BOOST')} vaultId={vault.id} />
              </Typography>
            </div>
          )}
          {/* Deposit */}
          {(!isBoosted || !userStaked) && (
            <div className={clsx([classes.stat, classes.marginBottom])}>
              <Typography className={classes.label}>{t('DEPOSITED')}</Typography>
              <ValueText
                blurred={blurred}
                value={formatBigDecimals(totalDeposited, 8)}
                vaultId={vault.id}
              />
              {totalDepositedUsd.isGreaterThan(0) && (
                <Typography className={classes.label}>
                  <ValuePrice
                    blurred={blurred}
                    value={formatBigUsd(totalDepositedUsd)}
                    vaultId={vault.id}
                  />
                </Typography>
              )}
              {totalDeposited.isLessThan(0) && <div className={classes.boostSpacer} />}
            </div>
          )}
        </Link>
      </>
    );
  }
);

const ItemGovVaultRewards = connect(
  (state: BeefyState, { vaultId }: { vaultId: VaultGov['id'] }) => {
    const vault = selectVaultById(state, vaultId);
    const earnedToken = selectTokenById(state, vault.chainId, vault.earnedTokenId);
    const rewardsEarnedToken = selectGovVaultPendingRewardsInToken(state, vault.id);
    const rewardsEarnedUsd = selectGovVaultPendingRewardsInUsd(state, vault.id);
    const blurred = selectIsBalanceHidden(state);
    return { vault, earnedToken, rewardsEarnedToken, rewardsEarnedUsd, blurred };
  }
)(
  ({
    vault,
    rewardsEarnedToken,
    rewardsEarnedUsd,
    earnedToken,
    blurred,
  }: {
    vault: VaultEntity;
    rewardsEarnedToken: BigNumber;
    rewardsEarnedUsd: BigNumber;
    earnedToken: TokenEntity;
    blurred: boolean;
  }) => {
    const classes = useItemStyles(vault.id);
    const { t } = useTranslation();

    return (
      <Link className={classes.removeLinkStyles} to={`/${vault.chainId}/vault/${vault.id}`}>
        <div className={classes.stat1}>
          <Typography className={classes.label}>{t('Vault-Rewards')}</Typography>
          <Typography className={classes.value}>
            {formatBigDecimals(rewardsEarnedToken) + ` ${earnedToken.symbol}`}
          </Typography>

          {rewardsEarnedUsd.isGreaterThan(0) && (
            <Typography className={classes.label}>
              <ValuePrice blurred={blurred} value={rewardsEarnedUsd} vaultId={vault.id} />
            </Typography>
          )}
        </div>
      </Link>
    );
  }
);

const ItemStandardVaultSafetyScore = connect(
  (state: BeefyState, { vaultId }: { vaultId: VaultStandard['id'] }) => {
    const vault = selectVaultById(state, vaultId);
    const isBoosted = selectIsVaultBoosted(state, vaultId);
    return { vault, isBoosted };
  }
)(({ vault, isBoosted }: { vault: VaultEntity; isBoosted: boolean }) => {
  const classes = useItemStyles(vault.id);
  const { t } = useTranslation();

  return (
    <div className={isBoosted ? classes.stat1 : classes.stat}>
      <div className={classes.tooltipLabel}>
        <Typography className={classes.safetyLabel}>{t('Safety-Score')}</Typography>
        <div className={classes.tooltipHolder}>
          <Popover
            {...({
              title: t('Safety-ScoreWhat'),
              content: t('Safety-ScoreExpl'),
            } as any)}
          />
        </div>
      </div>
      <SafetyScore score={vault.safetyScore} whiteLabel size="sm" />
    </div>
  );
});

const ItemWalletAmount = connect(
  (state: BeefyState, { vaultId }: { vaultId: VaultEntity['id'] }) => {
    const vault = selectVaultById(state, vaultId);
    const oracleToken = selectTokenById(state, vault.chainId, vault.oracleId);
    const userOracleInWallet = byDecimals(
      selectWalletBalanceOfToken(state, vault.chainId, vault.oracleId),
      oracleToken.decimals
    );
    const price = selectTokenPriceByTokenId(state, oracleToken.id);
    const userOracleInWalletUsd = userOracleInWallet.multipliedBy(price);
    const totalDeposited = selectUserVaultDepositInToken(state, vaultId);
    const blurred = selectIsBalanceHidden(state);
    return { vault, userOracleInWallet, userOracleInWalletUsd, totalDeposited, blurred };
  }
)(
  ({
    vault,
    userOracleInWallet,
    userOracleInWalletUsd,
    totalDeposited,
    blurred,
  }: {
    vault: VaultEntity;
    userOracleInWallet: BigNumber;
    userOracleInWalletUsd: BigNumber;
    totalDeposited: BigNumber;
    blurred: boolean;
  }) => {
    const classes = useItemStyles(vault.id);
    const { t } = useTranslation();

    return (
      <Link className={classes.removeLinkStyles} to={`/${vault.chainId}/vault/${vault.id}`}>
        <div className={clsx([classes.stat, classes.marginBottom])}>
          <Typography className={classes.label}>{t('WALLET')}</Typography>
          <ValueText
            blurred={blurred}
            value={formatBigDecimals(userOracleInWallet, 4)}
            vaultId={vault.id}
          />
          {userOracleInWallet.gt(0) && (
            <Typography className={classes.label}>
              <ValuePrice
                blurred={blurred}
                value={formatBigUsd(userOracleInWalletUsd)}
                vaultId={vault.id}
              />
            </Typography>
          )}
          {totalDeposited.isGreaterThan(0) && userOracleInWallet.isLessThanOrEqualTo(0) && (
            <div className={classes.boostSpacer} />
          )}
        </div>
      </Link>
    );
  }
);

const ItemVaultPresentation = connect(
  (state: BeefyState, { vaultId }: { vaultId: VaultEntity['id'] }) => {
    const vault = selectVaultById(state, vaultId);
    const chain = selectChainById(state, vault.chainId);
    const platform = selectPlatformById(state, vault.platformId);
    const earnedToken = selectTokenById(state, vault.chainId, vault.earnedTokenId);
    return { vault, chain, platform, earnedToken };
  }
)(
  ({
    vault,
    chain,
    platform,
    earnedToken,
  }: {
    vault: VaultEntity;
    chain: ChainEntity;
    platform: PlatformEntity;
    earnedToken: TokenEntity;
  }) => {
    const classes = useItemStyles(vault.id);
    const { t } = useTranslation();
    return (
      <Link className={classes.removeLinkStyles} to={`/${vault.chainId}/vault/${vault.id}`}>
        {/*Vault Image */}
        <div className={classes.infoContainer}>
          <Hidden smDown>
            <AssetsImage
              img={vault.logoUri}
              assets={vault.assetIds}
              alt={vault.name}
              {...({ size: '60px' } as any)}
            />
          </Hidden>
          <div className={classes.badgesContainter}>
            <div className={classes.flexCenter}>
              <Hidden mdUp>
                <AssetsImage
                  img={vault.logoUri}
                  assets={vault.assetIds}
                  alt={vault.name}
                  {...({ size: '60px' } as any)}
                />
              </Hidden>
              <div>
                {isGovVault(vault) ? (
                  <Typography className={classes.govVaultTitle}>
                    EARN {earnedToken.symbol}
                  </Typography>
                ) : null}
                <Typography variant="h4" className={classes.vaultName}>
                  {vault.name}
                </Typography>
              </div>
            </div>
            <div className={classes.badges}>
              {/*Network Image*/}
              <div className={classes.spacingMobile}>
                <img
                  alt={chain.name}
                  src={require(`../../../../images/networks/${chain.id}.svg`).default}
                  width={24}
                  height={24}
                  style={{ width: '24px', height: '24px' }}
                />
              </div>
              {/* Vault Tags */}
              <DisplayTags vaultId={vault.id} />
            </div>
            <span className={classes.platformContainer}>
              <Box sx={{ marginRight: '8px' }}>
                <Typography className={classes.platformLabel}>
                  {t('Chain')}: <span>{chain.name}</span>
                </Typography>
              </Box>
              <Box>
                <Typography className={classes.platformLabel}>
                  {t('PLATFORM')}: <span>{platform.name}</span>
                </Typography>
              </Box>
            </span>
          </div>
        </div>
      </Link>
    );
  }
);

export const Item = connect((state: BeefyState, { vault }: { vault: VaultEntity }) => {
  const isBoosted = selectIsVaultBoosted(state, vault.id);
  const balanceLoaded = state.ui.dataLoader.byChainId[vault.chainId]?.balance.alreadyLoadedOnce;
  const tvlLoaded =
    state.ui.dataLoader.byChainId[vault.chainId]?.contractData.alreadyLoadedOnce &&
    state.ui.dataLoader.global.prices.alreadyLoadedOnce;
  return { vault, isBoosted, balanceLoaded, tvlLoaded };
})(
  ({
    vault,
    isBoosted,
    balanceLoaded,
    tvlLoaded,
  }: {
    vault: VaultEntity;
    isBoosted: boolean;
    balanceLoaded: boolean;
    tvlLoaded: boolean;
  }) => {
    const classes = useItemStyles(vault.id);
    return (
      <div className={classes.boosterSpace}>
        <div
          className={clsx({
            [classes.itemContainer]: true,
            [classes.withMuted]: !isVaultActive(vault),
            [classes.withIsLongName]: vault.name.length > 12,
            [classes.withBoosted]: isBoosted,
            [classes.withGovVault]: isGovVault(vault),
          })}
        >
          <Grid container>
            {/* Title Container */}
            <Grid item xs={12} md={4} lg={4}>
              <ItemVaultPresentation vaultId={vault.id} />
            </Grid>
            {/* Content Container */}
            <Grid item xs={12} md={8} lg={8} className={classes.contentContainer}>
              <Grid container>
                <Grid item xs={6} md={2} lg={2}>
                  {balanceLoaded && <ItemWalletAmount vaultId={vault.id} />}
                </Grid>

                <Grid item xs={6} md={2} lg={2}>
                  {balanceLoaded && <ItemDeposited vaultId={vault.id} />}
                </Grid>
                <ApyStats vaultId={vault.id} />
                <Grid item xs={6} md={2} lg={2}>
                  {tvlLoaded && <ItemTvl vaultId={vault.id} />}
                </Grid>
                <Grid item xs={6} md={2} lg={2}>
                  {isGovVault(vault) ? (
                    balanceLoaded && <ItemGovVaultRewards vaultId={vault.id} />
                  ) : (
                    <ItemStandardVaultSafetyScore vaultId={vault.id} />
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </div>
      </div>
    );
  }
);

function useIsTwoColumns() {
  return useMediaQuery('(min-width: 600px) and (max-width: 960px)');
}

/**
 * This should not exist, we should split styles by individual components
 */
const useStyles = makeStyles(styles as any);
function useItemStyles(vaultId: VaultEntity['id']) {
  const isTwoColumns = useIsTwoColumns();

  const hasPendingRewards = useSelector((state: BeefyState) =>
    selectHasGovVaultPendingRewards(state, vaultId)
  );
  const styleProps = {
    marginStats: isTwoColumns,
    removeMarginButton: hasPendingRewards,
  };
  const classes = useStyles(styleProps as any);
  return classes;
}
