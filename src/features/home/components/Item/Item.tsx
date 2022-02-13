import React from 'react';
import { Grid, makeStyles, Typography, useMediaQuery, Box, Hidden } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { connect, useSelector } from 'react-redux';
import { AssetsImage } from '../../../../components/AssetsImage';
import { SafetyScore } from '../../../../components/SafetyScore';
import { DisplayTags } from '../../../../components/vaultTags';
import { formatBigUsd, formatBigDecimals } from '../../../../helpers/format';
import { styles } from './styles';
import clsx from 'clsx';
import { DailyApyStats, YearlyApyStats } from '../../../../components/ApyStats';
import { selectIsVaultBoosted } from '../../../data/selectors/boosts';
import {
  isGovVault,
  isVaultActive,
  VaultEntity,
  VaultGov,
  VaultStandard,
} from '../../../data/entities/vault';
import { BeefyState } from '../../../../redux-types';
import {
  selectHasGovVaultPendingRewards,
  selectUserVaultDepositInToken,
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
import {
  popoverInLinkHack__linkHandler,
  popoverInLinkHack__linkContentStyle,
  popoverInLinkHack__linkStyle,
} from '../../../../helpers/list-popover-in-link-hack';
import { VaultTvl } from '../../../../components/VaultTvl/VaultTvl';
import { ValueBlock } from '../../../../components/ValueBlock/ValueBlock';
import { VaultDeposited } from '../../../../components/VaultDeposited/VaultDeposited';
import { GovVaultRewards } from '../../../../components/GovVaultRewards/GovVaultRewards';

const ItemTvl = React.memo(({ vaultId }: { vaultId: VaultEntity['id'] }) => {
  const classes = useItemStyles(vaultId);
  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));
  const isBoosted = useSelector((state: BeefyState) => selectIsVaultBoosted(state, vaultId));

  return (
    <div className={isGovVault(vault) || isBoosted ? classes.stat1 : classes.stat}>
      <VaultTvl vaultId={vaultId} />
    </div>
  );
});

const _ItemDeposited = connect((state: BeefyState, { vaultId }: { vaultId: VaultEntity['id'] }) => {
  const vault = selectVaultById(state, vaultId);
  const deposit = selectUserVaultDepositInToken(state, vault.id);
  const hasDeposit = deposit.gt(0);
  return {
    vaultId,
    hasDeposit,
  };
})(({ vaultId, hasDeposit }: { vaultId: VaultEntity['id']; hasDeposit: boolean }) => {
  const classes = useItemStyles(vaultId);

  return (
    <div className={clsx([classes.stat, classes.marginBottom])}>
      <VaultDeposited vaultId={vaultId} />
      {hasDeposit && <div className={classes.boostSpacer} />}
    </div>
  );
});
const ItemDeposited = React.memo(_ItemDeposited);

const ItemGovVaultRewards = React.memo(({ vaultId }: { vaultId: VaultGov['id'] }) => {
  const classes = useItemStyles(vaultId);

  return (
    <div className={classes.stat1}>
      <GovVaultRewards vaultId={vaultId} />
    </div>
  );
});

const _ItemStandardVaultSafetyScore = connect(
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
      <ValueBlock
        label={t('Safety-Score')}
        textContent={false}
        value={<SafetyScore score={vault.safetyScore} whiteLabel size="sm" />}
        tooltip={{
          title: t('Safety-ScoreWhat'),
          content: t('Safety-ScoreExpl'),
        }}
      />
    </div>
  );
});
const ItemStandardVaultSafetyScore = React.memo(_ItemStandardVaultSafetyScore);

const _ItemWalletAmount = connect(
  (state: BeefyState, { vaultId }: { vaultId: VaultEntity['id'] }) => {
    const vault = selectVaultById(state, vaultId);
    const userOracleInWallet = selectWalletBalanceOfToken(state, vault.chainId, vault.oracleId);
    const price = selectTokenPriceByTokenId(state, vault.oracleId);
    const userOracleInWalletUsd = userOracleInWallet.multipliedBy(price);

    const blurred = selectIsBalanceHidden(state);
    const isLoaded =
      state.ui.dataLoader.global.prices.alreadyLoadedOnce &&
      state.ui.dataLoader.byChainId[vault.chainId]?.balance.alreadyLoadedOnce;
    return {
      vault,
      hasInWallet: userOracleInWallet.gt(0),
      userOracleInWallet: formatBigDecimals(userOracleInWallet, 4, false),
      userOracleInWalletUsd: formatBigUsd(userOracleInWalletUsd),
      blurred,
      loading: !isLoaded,
    };
  }
)(
  ({
    vault,
    hasInWallet,
    userOracleInWallet,
    userOracleInWalletUsd,
    blurred,
    loading,
  }: {
    vault: VaultEntity;
    hasInWallet: boolean;
    userOracleInWallet: string;
    userOracleInWalletUsd: string;
    blurred: boolean;
    loading: boolean;
  }) => {
    const classes = useItemStyles(vault.id);
    const { t } = useTranslation();

    return (
      <div className={clsx([classes.stat, classes.marginBottom])}>
        <ValueBlock
          label={t('WALLET')}
          value={userOracleInWallet}
          usdValue={hasInWallet ? userOracleInWalletUsd : null}
          blurred={blurred}
          loading={loading}
        />
        {hasInWallet && <div className={classes.boostSpacer} />}
      </div>
    );
  }
);
const ItemWalletAmount = React.memo(_ItemWalletAmount);

const _ItemVaultPresentation = connect(
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
      <>
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
      </>
    );
  }
);
const ItemVaultPresentation = React.memo(_ItemVaultPresentation);

const _Item = connect((state: BeefyState, { vault }: { vault: VaultEntity }) => {
  const isBoosted = selectIsVaultBoosted(state, vault.id);
  return { vault, isBoosted };
})(({ vault, isBoosted }: { vault: VaultEntity; isBoosted: boolean }) => {
  const classes = useItemStyles(vault.id);

  return (
    <Link
      className={classes.removeLinkStyles}
      onClick={popoverInLinkHack__linkHandler}
      onTouchStart={popoverInLinkHack__linkHandler}
      style={popoverInLinkHack__linkStyle}
      to={`/${vault.chainId}/vault/${vault.id}`}
    >
      <div
        style={popoverInLinkHack__linkContentStyle}
        className={clsx({
          [classes.itemContainer]: true,
          [classes.withMuted]: !isVaultActive(vault),
          [classes.withIsLongName]: vault.name.length > 12,
          [classes.withBoosted]: isBoosted,
          [classes.withGovVault]: isGovVault(vault),
        })}
      >
        <Grid container>
          <Grid item xs={12} md={4} lg={4}>
            <ItemVaultPresentation vaultId={vault.id} />
          </Grid>
          {/* Content Container */}
          <Grid item xs={12} md={8} lg={8} className={classes.contentContainer}>
            <Grid container>
              <Grid item xs={6} md={2} lg={2}>
                <ItemWalletAmount vaultId={vault.id} />
              </Grid>

              <Grid item xs={6} md={2} lg={2}>
                <ItemDeposited vaultId={vault.id} />
              </Grid>

              <Grid item xs={6} md={2} lg={2}>
                <div className={classes.stat1}>
                  <YearlyApyStats vaultId={vault.id} />
                </div>
              </Grid>

              <Grid item xs={6} md={2} lg={2}>
                <div className={classes.stat1}>
                  <DailyApyStats vaultId={vault.id} />
                </div>
              </Grid>

              <Grid item xs={6} md={2} lg={2}>
                <ItemTvl vaultId={vault.id} />
              </Grid>

              <Grid item xs={6} md={2} lg={2}>
                {isGovVault(vault) ? (
                  <ItemGovVaultRewards vaultId={vault.id} />
                ) : (
                  <ItemStandardVaultSafetyScore vaultId={vault.id} />
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </Link>
  );
});
export const Item = React.memo(_Item);

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
