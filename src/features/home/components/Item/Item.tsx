import React from 'react';
import { Grid, makeStyles, Typography, Box, Hidden } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { AssetsImage } from '../../../../components/AssetsImage';
import { SafetyScore } from '../../../../components/SafetyScore';
import { DisplayTags } from '../../../../components/vaultTags';
import { styles } from './styles';
import clsx from 'clsx';
import { DailyApyStats, YearlyApyStats } from '../../../../components/ApyStats';
import { selectIsVaultPreStakedOrBoosted } from '../../../data/selectors/boosts';
import { isGovVault, isVaultPausedOrRetired, VaultEntity } from '../../../data/entities/vault';
import { BeefyState } from '../../../../redux-types';
import { selectChainById } from '../../../data/selectors/chains';
import { selectTokenById } from '../../../data/selectors/tokens';
import { selectVaultById } from '../../../data/selectors/vaults';
import { ChainEntity } from '../../../data/entities/chain';
import { TokenEntity } from '../../../data/entities/token';
import { popoverInLinkHack__linkHandler } from '../../../../helpers/list-popover-in-link-hack';
import { VaultTvl } from '../../../../components/VaultTvl/VaultTvl';
import { ValueBlock } from '../../../../components/ValueBlock/ValueBlock';
import { VaultDeposited } from '../../../../components/VaultDeposited/VaultDeposited';
import { GovVaultRewards } from '../../../../components/GovVaultRewards/GovVaultRewards';
import { VaultWalletAmount } from '../../../../components/VaultWalletAmount/VaultWalletAmount';

const useStyles = makeStyles(styles as any);

const _ItemVaultPresentation = connect(
  (state: BeefyState, { vaultId }: { vaultId: VaultEntity['id'] }) => {
    const vault = selectVaultById(state, vaultId);
    const chain = selectChainById(state, vault.chainId);
    const earnedToken = selectTokenById(state, vault.chainId, vault.earnedTokenId);
    return { vault, chain, earnedToken };
  }
)(
  ({
    vault,
    chain,
    earnedToken,
  }: {
    vault: VaultEntity;
    chain: ChainEntity;
    earnedToken: TokenEntity;
  }) => {
    const classes = useStyles();
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
                  {t('Chain')} <span>{chain.name}</span>
                </Typography>
              </Box>
              <Box>
                <Typography className={classes.platformLabel}>
                  {t('Platform')} <span>{vault.tokenDescription}</span>
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
  const isBoosted = selectIsVaultPreStakedOrBoosted(state, vault.id);
  return { vault, isBoosted };
})(({ vault, isBoosted }: { vault: VaultEntity; isBoosted: boolean }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <Link
      className={classes.removeLinkStyles}
      onClick={popoverInLinkHack__linkHandler}
      onTouchStart={popoverInLinkHack__linkHandler}
      to={`/${vault.chainId}/vault/${vault.id}`}
    >
      <div
        className={clsx({
          [classes.itemContainer]: true,
          [classes.withMuted]: isVaultPausedOrRetired(vault),
          [classes.withIsLongName]: vault.name.length > 12,
          [classes.withBoosted]: isBoosted,
          [classes.withGovVault]: isGovVault(vault) && !isVaultPausedOrRetired(vault),
        })}
      >
        <Grid container>
          <Grid item xs={12} md={4} lg={4}>
            <ItemVaultPresentation vaultId={vault.id} />
          </Grid>
          {/* Content Container */}
          <Grid item xs={12} md={8} lg={8} className={classes.contentContainer}>
            <Grid container>
              <Grid item xs={6} md={2} lg={2} className={classes.stat}>
                <VaultWalletAmount vaultId={vault.id} variant="small" />
              </Grid>

              <Grid item xs={6} md={2} lg={2} className={classes.stat}>
                <VaultDeposited vaultId={vault.id} variant="small" />
              </Grid>

              <Grid item xs={6} md={2} lg={2} className={classes.stat}>
                <YearlyApyStats vaultId={vault.id} variant="small" />
              </Grid>

              <Grid item xs={6} md={2} lg={2} className={classes.stat}>
                <DailyApyStats vaultId={vault.id} variant="small" />
              </Grid>

              <Grid item xs={6} md={2} lg={2} className={classes.stat}>
                <VaultTvl vaultId={vault.id} variant="small" />
              </Grid>

              <Grid item xs={6} md={2} lg={2} className={classes.stat}>
                {isGovVault(vault) ? (
                  <GovVaultRewards vaultId={vault.id} variant="small" />
                ) : (
                  <ValueBlock
                    label={t('Safety-Score')}
                    textContent={false}
                    value={<SafetyScore score={vault.safetyScore} whiteLabel size="sm" />}
                    tooltip={{
                      title: t('Safety-ScoreWhat'),
                      content: t('Safety-ScoreExpl'),
                    }}
                    variant="small"
                  />
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
