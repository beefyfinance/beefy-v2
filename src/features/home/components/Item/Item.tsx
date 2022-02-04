import { memo, ReactNode } from 'react';
import { Grid, makeStyles, Typography, useMediaQuery, Box, Hidden } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AssetsImage } from '../../../../components/AssetsImage';
import { SafetyScore } from '../../../../components/SafetyScore';
import { DisplayTags } from '../../../../components/vaultTags';
import { Popover } from '../../../../components/Popover';
import { formatBigNumber, formatBigUsd } from '../../../../helpers/format';
import { styles } from './styles';
import clsx from 'clsx';
import { ApyStats } from '../ApyStats';
import { ApyStatLoader } from '../../../../components/ApyStatLoader';
import { selectActiveVaultBoostIds, selectIsVaultBoosted } from '../../../data/selectors/boosts';
import { isGovVault, isVaultActive, VaultEntity } from '../../../data/entities/vault';
import { BeefyState } from '../../../../redux-types';
import { selectVaultTvl } from '../../../data/selectors/tvl';
import {
  selectGovVaultPendingRewardsInToken,
  selectGovVaultPendingRewardsInUsd,
  selectHasGovVaultPendingRewards,
  selectHasUserDepositInVault,
  selectUserVaultDepositInToken,
  selectUserVaultDepositInUsd,
} from '../../../data/selectors/balance';
import { selectIsBalanceHidden } from '../../../data/selectors/wallet';
import { selectChainById } from '../../../data/selectors/chains';
import { selectPlatformById } from '../../../data/selectors/platforms';
import { selectTokenById } from '../../../data/selectors/tokens';

function ValueText({
  styleProps,
  value,
  blurred = false,
}: {
  styleProps: StyleProps;
  value: ReactNode | null;
  blurred?: boolean;
}) {
  const classes = useStyles(styleProps as any);
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
  styleProps,
  value,
  blurred = false,
}: {
  styleProps: StyleProps;
  value: ReactNode | null;
  blurred?: boolean;
}) {
  const classes = useStyles(styleProps as any);
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

interface StyleProps {
  marginStats: boolean;
  removeMarginButton: boolean;
}
const useStyles = makeStyles(styles as any);

const _Item = ({ vault }: { vault: VaultEntity }) => {
  const isTwoColumns = useMediaQuery('(min-width: 600px) and (max-width: 960px)');
  const hasPendingRewards = useSelector((state: BeefyState) =>
    selectHasGovVaultPendingRewards(state, vault.id)
  );
  const chain = useSelector((state: BeefyState) => selectChainById(state, vault.chainId));
  const platform = useSelector((state: BeefyState) => selectPlatformById(state, vault.platformId));
  const isBoosted = useSelector((state: BeefyState) => selectIsVaultBoosted(state, vault.id));
  const activeBoosts = useSelector((state: BeefyState) =>
    selectActiveVaultBoostIds(state, vault.id)
  );
  const vaultTvl = useSelector((state: BeefyState) => selectVaultTvl(state, vault.id));
  const earnedToken = useSelector((state: BeefyState) =>
    isGovVault(vault) ? selectTokenById(state, chain.id, vault.oracleId) : null
  );
  const userDeposited = useSelector((state: BeefyState) =>
    selectUserVaultDepositInToken(state, chain.id, vault.id)
  );
  const userDepositedUsd = useSelector((state: BeefyState) =>
    selectUserVaultDepositInUsd(state, chain.id, vault.id)
  );
  const userStaked = useSelector((state: BeefyState) =>
    selectHasUserDepositInVault(state, chain.id, vault.id)
  );
  const totalDeposited = useSelector((state: BeefyState) =>
    selectUserVaultDepositInToken(state, chain.id, vault.id)
  );
  const totalDepositedUsd = useSelector((state: BeefyState) =>
    selectUserVaultDepositInUsd(state, chain.id, vault.id)
  );
  const rewardsEarnedToken = useSelector((state: BeefyState) =>
    selectGovVaultPendingRewardsInToken(state, vault.id)
  );
  const rewardsEarnedUsd = useSelector((state: BeefyState) =>
    selectGovVaultPendingRewardsInUsd(state, vault.id)
  );
  const hideBalance = useSelector(selectIsBalanceHidden);

  const { t } = useTranslation();

  const styleProps = {
    marginStats: isTwoColumns,
    removeMarginButton: hasPendingRewards,
  };
  const classes = useStyles(styleProps as any);

  const blurred = totalDeposited.isGreaterThan(0) && hideBalance;

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
            <Link className={classes.removeLinkStyles} to={`/${chain.id}/vault/${vault.id}`}>
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
                      {isGovVault(vault)
                        ? /*
                        <Typography className={classes.govVaultTitle}>
                          EARN {vault.earnedToken}
                        </Typography>*/
                          ''
                        : null}
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
          </Grid>
          {/* Content Container */}
          <Grid item xs={12} md={8} lg={8} className={classes.contentContainer}>
            <Grid container>
              <Grid item xs={6} md={2} lg={2}>
                <Link className={classes.removeLinkStyles} to={`/${chain.id}/vault/${vault.id}`}>
                  <div className={clsx([classes.stat, classes.marginBottom])}>
                    <Typography className={classes.label}>{t('WALLET')}</Typography>
                    <ValueText
                      blurred={blurred}
                      value={formatBigNumber(userDeposited)}
                      styleProps={styleProps}
                    />
                    {userStaked && (
                      <Typography className={classes.label}>
                        <ValuePrice
                          blurred={blurred}
                          value={userDepositedUsd}
                          styleProps={styleProps}
                        />
                      </Typography>
                    )}
                    {totalDeposited.isGreaterThan(0) && userDeposited.isLessThanOrEqualTo(0) && (
                      <div className={classes.boostSpacer} />
                    )}
                  </div>
                </Link>
              </Grid>
              <Grid item xs={6} md={2} lg={2}>
                <Link className={classes.removeLinkStyles} to={`/${chain.id}/vault/${vault.id}`}>
                  {/*Boosted by */}
                  {isBoosted && userStaked && (
                    <div className={clsx([classes.stat, classes.marginBottom])}>
                      <Typography className={classes.label}>{t('STAKED-IN')}</Typography>
                      <ValueText value={activeBoosts.join(', ')} styleProps={styleProps} />
                      <Typography className={classes.label}>
                        <ValuePrice value={t('BOOST')} styleProps={styleProps} />
                      </Typography>
                    </div>
                  )}
                  {/* Deposit */}
                  {(!isBoosted || !userStaked) && (
                    <div className={clsx([classes.stat, classes.marginBottom])}>
                      <Typography className={classes.label}>{t('DEPOSITED')}</Typography>
                      <ValueText
                        blurred={blurred}
                        value={formatBigNumber(totalDeposited)}
                        styleProps={styleProps}
                      />
                      {totalDepositedUsd.isGreaterThan(0) && (
                        <Typography className={classes.label}>
                          <ValuePrice
                            blurred={blurred}
                            value={formatBigUsd(totalDepositedUsd)}
                            styleProps={styleProps}
                          />
                        </Typography>
                      )}
                      {userDeposited.isGreaterThan(0) && totalDeposited.isLessThan(0) && (
                        <div className={classes.boostSpacer} />
                      )}
                    </div>
                  )}
                </Link>
              </Grid>
              {/**APY STATS*/}
              <ApyStats vaultId={vault.id} />
              <Grid item xs={6} md={2} lg={2}>
                <Link className={classes.removeLinkStyles} to={`/${chain.id}/vault/${vault.id}`}>
                  {/*Tvl */}
                  <div className={isGovVault || isBoosted ? classes.stat1 : classes.stat}>
                    <Typography className={classes.label}>{t('TVL')}</Typography>
                    <Typography className={classes.value}>{formatBigUsd(vaultTvl)}</Typography>
                    {isBoosted ||
                    (totalDeposited.isGreaterThan(0) && !isTwoColumns) ||
                    (userDeposited.isGreaterThan(0) && !isTwoColumns) ? (
                      <div className={classes.boostSpacer} />
                    ) : null}
                  </div>
                </Link>
              </Grid>
              <Grid item xs={6} md={2} lg={2}>
                {isGovVault ? (
                  '' /*
                  <Link className={classes.removeLinkStyles} to={`/${chain.id}/vault/${vault.id}`}>
                    <div className={classes.stat1}>
                      <Typography className={classes.label}>{t('Vault-Rewards')}</Typography>
                      <Typography className={classes.value}>
                        {(formatDecimals(rewardsEarnedToken) ?? '') + ` ${vault.earnedToken}`}
                      </Typography>

                      {totalDeposited.balance.isGreaterThan(0) && (
                        <Typography className={classes.label}>
                          <ValuePrice
                            blurred={blurred}
                            value={rewardPrice}
                            styleProps={styleProps}
                          />
                        </Typography>
                      )}
                    </div>
                  </Link>*/
                ) : (
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
                    {/*<SafetyScore score={vault.safetyScore} whiteLabel size="sm" />*/}
                  </div>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export const Item = memo(_Item);
