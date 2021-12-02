import React, { memo, useMemo } from 'react';
import { Button, Grid, makeStyles, Typography, useMediaQuery } from '@material-ui/core';
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
  const { wallet, balance } = useSelector((state: any) => ({
    wallet: state.walletReducer,
    balance: state.balanceReducer,
  }));
  const pricesReducer = useSelector((state: any) => state.pricesReducer);
  const [priceInDolar, setPriceInDolar] = React.useState({ balance: '0' });
  const [poolRewards, setPoolRewards] = React.useState({ rewards: '0' });
  const [userStaked, setUserStaked] = React.useState(false);
  const formattedTVL = useMemo(() => formatUsd(item.tvl), [item.tvl]);

  const blurred = parseFloat(priceInDolar.balance) > 0 && hideBalance;

  const styleProps = {
    marginStats: isTwoColumns && !isGovVault && !isBoosted,
    removeMarginButton: isGovVault && parseFloat(poolRewards.rewards) > 0,
  };
  const classes = useStyles(styleProps as any);

  React.useEffect(() => {
    let amount = '0';
    let rewardAmount = '0';
    if (item.isGovVault) {
      let symbol = `${item.token}GovVault`;
      if (wallet.address && !isEmpty(balance.tokens[item.network][symbol])) {
        amount = byDecimals(
          new BigNumber(balance.tokens[item.network][symbol].balance),
          item.tokenDecimals
        ).toFixed(8);

        rewardAmount = byDecimals(
          new BigNumber(balance.tokens[item.network][symbol].rewards),
          item.tokenDecimals
        ).toFixed(8);
      }
    } else {
      let sumAmount = new BigNumber(0);
      if (wallet.address && !isEmpty(balance.tokens[item.network][item.earnedToken])) {
        sumAmount = byDecimals(
          new BigNumber(balance.tokens[item.network][item.earnedToken].balance)
            .multipliedBy(byDecimals(item.pricePerFullShare))
            .toFixed(8),
          item.tokenDecimals
        );
        // ).toFixed(8);
      }
      if (wallet) {
        for (const boost of vaultBoosts) {
          let symbol = `${boost.token}${boost.id}Boost`;
          if (!isEmpty(balance.tokens[item.network][symbol])) {
            sumAmount = sumAmount.plus(
              byDecimals(
                new BigNumber(balance.tokens[item.network][symbol].balance).multipliedBy(
                  byDecimals(item.pricePerFullShare)
                ),
                item.tokenDecimals
              )
            );
          }
        }
      }
      amount = sumAmount.toFixed(8);
    }
    if (!isNaN(parseFloat(amount))) setPriceInDolar({ balance: amount });
    if (!isNaN(parseFloat(rewardAmount))) setPoolRewards({ rewards: rewardAmount });
  }, [wallet.address, item, balance, vaultBoosts, wallet]);

  React.useEffect(() => {
    let staked = false;
    if (wallet.address && boostedData) {
      let symbol = `${boostedData.token}${boostedData.id}Boost`;
      if (
        !isEmpty(balance.tokens[item.network][symbol]) &&
        new BigNumber(balance.tokens[item.network][symbol].balance).toNumber() > 0
      ) {
        staked = true;
      }
    }
    setUserStaked(staked);
  }, [balance.tokens, boostedData, item.network, wallet.address]);

  const ValueText = ({ value, blurred = false }) => (
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

  const ValuePrice = ({ value, blurred = false }) => (
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

  const rewardPrice = React.useMemo(() => {
    return parseFloat(poolRewards.rewards) > 0
      ? new BigNumber(pricesReducer.prices[item.earnedToken])
          .times(parseFloat(poolRewards.rewards))
          .toFixed(2)
      : 0;
  }, [item.earnedToken, poolRewards.rewards, pricesReducer.prices]);

  const tokensEarned = React.useMemo(() => {
    return parseFloat(priceInDolar.balance) > 0 ? priceInDolar.balance : '0';
  }, [priceInDolar.balance]);

  const rewardsEarned = React.useMemo(() => {
    return parseFloat(poolRewards.rewards) > 0 ? poolRewards.rewards : '0';
  }, [poolRewards.rewards]);

  return (
    <div
      className={clsx({
        [classes.itemContainer]: true,
        [classes.withHasDeposit]: item.balance > 0,
        [classes.withMuted]: item.status === 'paused' || item.status === 'eol',
        [classes.withIsLongName]: item.name.length > 12,
        [classes.withBoosted]: isBoosted,
        [classes.withGovVault]: isGovVault,
      })}
    >
      <Grid container className={classes.dataGrid}>
        {/*Title*/}
        <div className={classes.titleContainer}>
          <Grid container>
            <Grid
              item
              className={classes.infoContainer}
              style={{ marginRight: '8px', cursor: 'pointer' }}
            >
              <Link className={classes.removeLinkStyles} to={`/${item.network}/vault/${item.id}`}>
                {/*Vault Image*/}
                <AssetsImage
                  img={item.logo}
                  assets={item.assets}
                  alt={item.name}
                  {...({ size: '60px' } as any)}
                />
              </Link>
            </Grid>
            <Grid item>
              <Link className={classes.removeLinkStyles} to={`/${item.network}/vault/${item.id}`}>
                {isGovVault ? (
                  <Typography className={classes.govVaultTitle}>EARN {item.earnedToken}</Typography>
                ) : null}
                <div className={classes.infoContainer}>
                  {/*Vault Name*/}
                  <Typography className={classes.vaultName}>{item.name}</Typography>
                </div>
                <div className={classes.badgesContainter}>
                  <div className={classes.badges}>
                    {/*Network Image*/}
                    <img
                      alt={item.network}
                      src={require(`../../../../images/networks/${item.network}.svg`).default}
                      width={24}
                      height={24}
                      style={{ width: '24px', height: '24px' }}
                    />
                    {/*Vault Tags*/}
                    <DisplayTags isBoosted={isBoosted} tags={item.tags} />
                  </div>
                </div>
              </Link>
              <span className={classes.platformContainer}>
                <Typography className={classes.platformLabel}>{t('PLATFORM')}:&nbsp;</Typography>
                <Typography className={classes.platformValue}>{item.platform}</Typography>
              </span>
            </Grid>
          </Grid>
        </div>
        <div className={classes.statsContainer}>
          <Grid container>
            {/*BOOSTED BY*/}
            {/* {isBoosted && parseInt(priceInDolar.balance) === 0 && ( */}
            {isBoosted && userStaked && (
              <div className={classes.centerSpace}>
                <div className={classes.stat}>
                  <Typography className={classes.label}>{t('STAKED-IN')}</Typography>
                  <ValueText value={boostedData.name} />
                  <Typography className={classes.label}>
                    <ValuePrice value={t('BOOST')} />
                  </Typography>
                </div>
              </div>
            )}
            {/*DEPOSIT*/}
            {(!isBoosted || !userStaked) && (
              <div className={classes.centerSpace}>
                <div className={classes.stat}>
                  <Typography className={classes.label}>{t('DEPOSITED')}</Typography>

                  <ValueText blurred={blurred} value={tokensEarned} />

                  {parseFloat(priceInDolar.balance) > 0 && (
                    <Typography className={classes.label}>
                      <ValuePrice
                        blurred={blurred}
                        value={formatUsd(priceInDolar.balance, item.oraclePrice)}
                      />
                    </Typography>
                  )}
                  {/* {parseInt(priceInDolar.balance) > 0 ? (
                    <div className={classes.boostSpacer} />
                  ) : null} */}
                </div>
              </div>
            )}
            {/*TVL*/}
            <div className={classes.centerSpace}>
              <div className={classes.stat}>
                <Typography className={classes.label}>{t('TVL')}</Typography>
                <Typography className={classes.value}>{formattedTVL}</Typography>
                {isTwoColumns || isBoosted || parseFloat(priceInDolar.balance) > 0 ? (
                  <div className={classes.boostSpacer} />
                ) : null}
              </div>
            </div>
            {/*APY STATS*/}
            <ApyStats
              {...({
                isBoosted: isBoosted,
                launchpoolApr: boostedData,
                apy: item.apy,
                spacer: isTwoColumns || (!isBoosted && parseFloat(priceInDolar.balance) > 0),
                isGovVault: item.isGovVault ?? false,
              } as any)}
            />
            {/*Rewards/Safety Score*/}
            {isGovVault ? (
              <div className={classes.centerSpace}>
                <div className={classes.stat}>
                  <Typography className={classes.label}>{t('Vault-Rewards')}</Typography>

                  <ValueText
                    blurred={blurred}
                    value={(rewardsEarned ?? '') + ` ${item.earnedToken}`}
                  />
                  {parseFloat(priceInDolar.balance) > 0 && (
                    <Typography className={classes.label}>
                      <ValuePrice
                        blurred={blurred}
                        value={formatUsd(rewardPrice, pricesReducer.prices[item.earnedToken])}
                      />
                    </Typography>
                  )}
                  {isTwoColumns ? <div className={classes.boostSpacer} /> : null}
                </div>
              </div>
            ) : (
              <div className={classes.centerSpace}>
                <div className={classes.stat}>
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
                  {isTwoColumns || isBoosted || parseFloat(priceInDolar.balance) > 0 ? (
                    <div className={classes.boostSpacer} />
                  ) : null}
                </div>
              </div>
            )}
            {/*Open Vault*/}
            <div className={classes.centerSpaceOpen} style={{ padding: 0 }}>
              <Link className={classes.removeLinkStyles} to={`/${item.network}/vault/${item.id}`}>
                <Button size="large" className={classes.depositButton}>
                  {isGovVault ? t('Vault-Open-Pool') : t('Vault-Open')}
                </Button>
              </Link>
            </div>
          </Grid>
        </div>
      </Grid>
    </div>
  );
};

export const Item = memo(_Item);
