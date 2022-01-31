import React, { memo, ReactNode, useMemo } from 'react';
import { Grid, makeStyles, Typography, useMediaQuery, Box, Hidden } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AssetsImage } from '../../../../components/AssetsImage';
import { SafetyScore } from '../../../../components/SafetyScore';
import { DisplayTags } from '../../../../components/vaultTags';
import { Popover } from '../../../../components/Popover';
import BigNumber from 'bignumber.js';
import { isEmpty } from '../../../../helpers/utils';
import { byDecimals, formatUsd } from '../../../../helpers/format';
import { styles } from './styles';
import clsx from 'clsx';
import { ApyStats } from '../ApyStats';
import { ApyStatLoader } from '../../../../components/ApyStatLoader';
import { useHideBalanceCtx } from '../../../../components/HideBalancesContext';

interface InitialVaultData {
  deposited: {
    balance: BigNumber;
    shares: BigNumber;
  };
  poolRewards: {
    balance: BigNumber;
    shares: BigNumber;
  };
  userStaked: boolean;
}

function getDepositedAndPoolRewards({
  vault: item,
  wallet,
  balance,
  vaultBoosts,
}: {
  vault: any;
  wallet: any;
  balance: any;
  vaultBoosts: any;
}): InitialVaultData {
  let res: InitialVaultData = {
    deposited: {
      balance: new BigNumber(0),
      shares: new BigNumber(0),
    },
    poolRewards: {
      balance: new BigNumber(0),
      shares: new BigNumber(0),
    },
    userStaked: false,
  };
  let symbol = item.isGovVault ? `${item.token}GovVault` : item.earnedToken;

  let balanceSingle = new BigNumber(0);
  let rewardsBalance = new BigNumber(0);
  let sharesBalance = new BigNumber(0);
  let rewardsSharesBalance = new BigNumber(0);

  if (wallet.address && !isEmpty(balance.tokens[item.network][symbol])) {
    if (item.isGovVault) {
      balanceSingle = byDecimals(balance.tokens[item.network][symbol].balance, item.tokenDecimals);
      rewardsBalance = byDecimals(
        new BigNumber(balance.tokens[item.network][symbol].rewards),
        item.tokenDecimals
      );
      sharesBalance = new BigNumber(balance.tokens[item.network][symbol].balance);
      rewardsSharesBalance = byDecimals(
        new BigNumber(balance.tokens[item.network][symbol].rewards)
      );
    } else {
      balanceSingle = byDecimals(
        new BigNumber(balance.tokens[item.network][item.earnedToken].balance)
          .multipliedBy(byDecimals(item.pricePerFullShare))
          .toFixed(8),
        item.tokenDecimals
      );
      sharesBalance = new BigNumber(balance.tokens[item.network][symbol].balance);
    }
    for (const boost of vaultBoosts) {
      let boostSymbol = `${boost.token}${boost.id}Boost`;
      if (!isEmpty(balance.tokens[item.network][boostSymbol])) {
        balanceSingle = balanceSingle.plus(
          byDecimals(
            new BigNumber(balance.tokens[item.network][boostSymbol].balance).multipliedBy(
              byDecimals(item.pricePerFullShare)
            ),
            item.tokenDecimals
          )
        );
        sharesBalance = sharesBalance.plus(
          new BigNumber(balance.tokens[item.network][boostSymbol].balance)
        );
        if (balanceSingle.isGreaterThan(0) && boost.id === item.boostData?.id) {
          res.userStaked = true;
        }
      }
    }
  }
  res.deposited = { balance: balanceSingle, shares: sharesBalance };
  res.poolRewards = { balance: rewardsBalance, shares: rewardsSharesBalance };
  return res;
}

const formatDecimals = number => {
  return number.isGreaterThanOrEqualTo(0)
    ? number.toFixed(4)
    : number.isEqualTo(0)
    ? 0
    : number.toFixed(8);
};

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
const _Item = ({ vault }) => {
  const item = vault;

  const isBoosted = vault.isBoosted;
  const boostedData = vault.boostData;
  const vaultBoosts = vault.boosts;
  const isGovVault = item.isGovVault;
  const isTwoColumns = useMediaQuery('(min-width: 600px) and (max-width: 960px)');

  const { hideBalance } = useHideBalanceCtx();

  const { t } = useTranslation();
  const { wallet, balance, tokens } = useSelector((state: any) => ({
    wallet: state.walletReducer,
    balance: state.balanceReducer,
    tokens: state.balanceReducer.tokens[item.network],
  }));
  const { deposited, poolRewards, userStaked } = React.useMemo(
    () => getDepositedAndPoolRewards({ vault: item, wallet, balance, vaultBoosts }),
    [wallet, item, balance, vaultBoosts]
  );
  const pricesReducer = useSelector((state: any) => state.pricesReducer);
  const formattedTVL = useMemo(() => formatUsd(item.tvl.toNumber()), [item.tvl]);

  const styleProps = {
    marginStats: isTwoColumns,
    removeMarginButton: isGovVault && poolRewards.balance.isGreaterThan(0),
  };
  const classes = useStyles(styleProps as any);

  const _deposited = deposited.balance.isGreaterThan(0)
    ? deposited.balance.toFixed(8)
    : new BigNumber(0).toFixed(0);

  const depositedUsd = deposited.balance.isGreaterThan(0)
    ? formatUsd(deposited.balance, pricesReducer.prices[item.oracleId])
    : formatUsd(0);

  const rewardsEarned = poolRewards.balance.isGreaterThan(0)
    ? poolRewards.shares
    : new BigNumber(0);

  const rewardPrice = poolRewards.balance.isGreaterThan(0)
    ? formatUsd(poolRewards.balance, pricesReducer.prices[item.earnedToken])
    : formatUsd(0);

  const _wallet = byDecimals(tokens[item.token].balance, tokens[item.token].decimals);

  const walletUsd = _wallet.isGreaterThan(0)
    ? formatUsd(_wallet, pricesReducer.prices[item.oracleId])
    : formatUsd(0);

  const blurred = (deposited.balance.isGreaterThan(0) || _wallet.isGreaterThan(0)) && hideBalance;

  return (
    <Link className={classes.removeLinkStyles} to={`/${item.network}/vault/${item.id}`}>
      <div
        className={clsx({
          [classes.itemContainer]: true,
          [classes.withMuted]: item.status === 'paused' || item.status === 'eol',
          [classes.withIsLongName]: item.name.length > 12,
          [classes.withBoosted]: isBoosted,
          [classes.withGovVault]: isGovVault,
        })}
      >
        <Grid container>
          {/* Title Container */}
          <Grid item xs={12} md={4} lg={4}>
            <Link className={classes.removeLinkStyles} to={`/${item.network}/vault/${item.id}`}>
              {/*Vault Image */}
              <div className={classes.infoContainer}>
                <Hidden smDown>
                  <AssetsImage
                    img={item.logo}
                    assets={item.assets}
                    alt={item.name}
                    {...({ size: '60px' } as any)}
                  />
                </Hidden>
                <div className={classes.badgesContainter}>
                  <div className={classes.flexCenter}>
                    <Hidden mdUp>
                      <AssetsImage
                        img={item.logo}
                        assets={item.assets}
                        alt={item.name}
                        {...({ size: '60px' } as any)}
                      />
                    </Hidden>
                    <div>
                      {isGovVault ? (
                        <Typography className={classes.govVaultTitle}>
                          EARN {item.earnedToken}
                        </Typography>
                      ) : null}
                      <Typography variant="h4" className={classes.vaultName}>
                        {item.name}
                      </Typography>
                    </div>
                  </div>
                  <div className={classes.badges}>
                    {/*Network Image*/}
                    <div className={classes.spacingMobile}>
                      <img
                        alt={item.network}
                        src={require(`../../../../images/networks/${item.network}.svg`).default}
                        width={24}
                        height={24}
                        style={{ width: '24px', height: '24px' }}
                      />
                    </div>
                    {/* Vault Tags */}
                    <DisplayTags
                      isBoosted={isBoosted}
                      tags={item.tags}
                      isMoonpot={item.moonpot.isMoonpot}
                    />
                  </div>
                  <span className={classes.platformContainer}>
                    <Box sx={{ marginRight: '8px' }}>
                      <Typography className={classes.platformLabel}>
                        {t('Chain')}: <span>{item.network}</span>
                      </Typography>
                    </Box>
                    <Box>
                      <Typography className={classes.platformLabel}>
                        {t('PLATFORM')}: <span>{item.platform}</span>
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
                <div className={clsx([classes.stat, classes.marginBottom])}>
                  <Typography className={classes.label}>{t('WALLET')}</Typography>
                  <ValueText
                    blurred={blurred}
                    value={_wallet.isGreaterThan(0) ? _wallet.toFixed(4) : _wallet.toFixed(0)}
                    styleProps={styleProps}
                  />
                  {_wallet.isGreaterThan(0) && (
                    <Typography className={classes.label}>
                      <ValuePrice blurred={blurred} value={walletUsd} styleProps={styleProps} />
                    </Typography>
                  )}
                  {deposited.balance.isGreaterThan(0) && _wallet.isLessThanOrEqualTo(0) && (
                    <div className={classes.boostSpacer} />
                  )}
                </div>
              </Grid>
              <Grid item xs={6} md={2} lg={2}>
                {/*Boosted by */}
                {isBoosted && userStaked && (
                  <div className={clsx([classes.stat, classes.marginBottom])}>
                    <Typography className={classes.label}>{t('STAKED-IN')}</Typography>
                    <ValueText value={boostedData.name} styleProps={styleProps} />
                    <Typography className={classes.label}>
                      <ValuePrice value={t('BOOST')} styleProps={styleProps} />
                    </Typography>
                  </div>
                )}
                {/* Deposit */}
                {(!isBoosted || !userStaked) && (
                  <div className={clsx([classes.stat, classes.marginBottom])}>
                    <Typography className={classes.label}>{t('DEPOSITED')}</Typography>
                    <ValueText blurred={blurred} value={_deposited} styleProps={styleProps} />
                    {deposited.balance.isGreaterThan(0) && (
                      <Typography className={classes.label}>
                        <ValuePrice
                          blurred={blurred}
                          value={depositedUsd}
                          styleProps={styleProps}
                        />
                      </Typography>
                    )}
                    {_wallet.isGreaterThan(0) && deposited.balance.isLessThan(0) && (
                      <div className={classes.boostSpacer} />
                    )}
                  </div>
                )}
              </Grid>
              {/**APY STATS*/}
              <ApyStats
                {...({
                  isBoosted: isBoosted,
                  launchpoolApr: boostedData,
                  apy: item.apy,
                } as any)}
              />
              <Grid item xs={6} md={2} lg={2}>
                {/*Tvl */}
                <div className={classes.stat1}>
                  <Typography className={classes.label}>{t('TVL')}</Typography>
                  <Typography className={classes.value}>{formattedTVL}</Typography>
                  {isBoosted ||
                  (deposited.balance.isGreaterThan(0) && !isTwoColumns) ||
                  (_wallet.isGreaterThan(0) && !isTwoColumns) ? (
                    <div className={classes.boostSpacer} />
                  ) : null}
                </div>
              </Grid>
              <Grid item xs={6} md={2} lg={2}>
                {isGovVault ? (
                  <div className={classes.stat1}>
                    <Typography className={classes.label}>{t('Vault-Rewards')}</Typography>
                    <ValueText
                      blurred={blurred}
                      value={(formatDecimals(rewardsEarned) ?? '') + ` ${item.earnedToken}`}
                      styleProps={styleProps}
                    />
                    {deposited.balance.isGreaterThan(0) && (
                      <Typography className={classes.label}>
                        <ValuePrice blurred={blurred} value={rewardPrice} styleProps={styleProps} />
                      </Typography>
                    )}
                  </div>
                ) : (
                  <div className={classes.stat1}>
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
                    <SafetyScore score={item.safetyScore} whiteLabel size="sm" />
                  </div>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </Link>
  );
};

export const Item = memo(_Item);
