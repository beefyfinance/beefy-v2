import React, {memo, useCallback, useMemo} from 'react';
import {Button, Grid, makeStyles, Typography} from '@material-ui/core';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import {useSelector} from 'react-redux';
import {AssetsImage} from '../../../../components/AssetsImage';
import {SafetyScore} from '../../../../components/SafetyScore';
import {DisplayTags} from '../../../../components/vaultTags';
import {Popover} from '../../../../components/Popover';
import BigNumber from 'bignumber.js';
import {isEmpty} from '../../../../helpers/utils';
import {byDecimals, formatUsd} from '../../../../helpers/format';
import {styles} from './styles';
import clsx from 'clsx';
import {ApyStats} from '../ApyStats';
import {ApyStatLoader} from '../../../../components/ApyStatLoader';
import {useIsBoosted} from '../../hooks/useIsBoosted';

const useStyles = makeStyles(styles as any);
const _Item = ({vault}) => {
  const item = vault;

  // eslint-disable-next-line no-unused-vars
  const {isBoosted, data: boostedData} = useIsBoosted(item);
  // eslint-disable-next-line
  // const [isGovVault] = React.useState(item.isGovVault ?? false);
  const isGovVault = item.isGovVault;

  const classes = useStyles();
  const {t} = useTranslation();
  const history = useHistory();
  const {wallet, balance} = useSelector((state: any) => ({
    wallet: state.walletReducer,
    balance: state.balanceReducer,
  }));
  const pricesReducer = useSelector((state: any) => state.pricesReducer);

  const [state, setState] = React.useState({ formattedBalance: '0' });
  const [priceInDolar, setPriceInDolar] = React.useState({ balance: '0' });
  const [poolRewards, setPoolRewards] = React.useState({ rewards: '0' });

  const formattedTVL = useMemo(() => formatUsd(item.tvl), [item.tvl]);

  const handleOpenVault = useCallback(() => {
    history.push(`/${item.network}/vault/${item.id}`);
  }, [history, item.network, item.id]);

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
      if (wallet.address && !isEmpty(balance.tokens[item.network][item.earnedToken])) {
        amount = byDecimals(
          new BigNumber(balance.tokens[item.network][item.earnedToken].balance).multipliedBy(
            byDecimals(item.pricePerFullShare)
          ),
          item.tokenDecimals
        ).toFixed(8);
      }
    }

    if (!isNaN(parseFloat(amount))) setPriceInDolar({ balance: amount });
    if (!isNaN(parseFloat(rewardAmount))) setPoolRewards({ rewards: rewardAmount });
  }, [wallet.address, item, balance]);

  React.useEffect(() => {
    let amount = '0';
    if (wallet.address) {
      amount = item.isGovVault
      ? byDecimals(
          new BigNumber(balance.tokens[item.network][`${item.token}GovVault`].balance),
          item.tokenDecimals
        ).toFixed(8)
      : byDecimals(new BigNumber(item.balance), item.tokenDecimals)
        .multipliedBy(byDecimals(new BigNumber(item.pricePerFullShare), item.tokenDecimals))
        .toFixed(8);
    }
    setState({ formattedBalance: amount });
  }, [
    wallet.address,
    item.balance,
    balance.isBalancesLoading,
    item.tokenDecimals,
    item.pricePerFullShare,
    isGovVault,
  ]);

  const ValueText = ({ value }) => (
    <>{value ? <span className={classes.value}>{value}</span> : <ApyStatLoader />}</>
  );

  const ValuePrice = ({ value }) => (
    <>{value ? <span className={classes.price}>{value}</span> : <ApyStatLoader />}</>
  );

  const price = React.useMemo(() => {
    return parseFloat(priceInDolar.balance) > 0
      ? new BigNumber(pricesReducer.prices[item.oracleId]).times(priceInDolar.balance).toFixed(2)
      : 0;
  }, [priceInDolar.balance, pricesReducer.prices, item.oracleId]);

  const rewardPrice = React.useMemo(() => {
    return parseFloat(poolRewards.rewards) > 0
      ? new BigNumber(pricesReducer.prices[item.earnedToken])
          .times(parseFloat(poolRewards.rewards))
          .toFixed(2)
      : 0;
  }, [poolRewards.rewards, pricesReducer.prices]);

  const tokensEarned = React.useMemo(() => {
    return parseFloat(state.formattedBalance) > 0 ? state.formattedBalance : '0';
  }, [state.formattedBalance]);

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
              onClick={handleOpenVault}
              className={classes.infoContainer}
              style={{ marginRight: '8px', cursor: 'pointer' }}
            >
              {/*Vault Image*/}
              <AssetsImage
                img={item.logo}
                assets={item.assets}
                alt={item.name}
                {...({ size: '60px' } as any)}
              />
            </Grid>
            <Grid item>
              <div>
                {isGovVault ? (
                  <Typography className={classes.govVaultTitle} onClick={handleOpenVault}>
                    EARN {item.earnedToken}
                  </Typography>
                ) : null}
                <div className={classes.infoContainer}>
                  {/*Vault Name*/}
                  <Typography className={classes.vaultName} onClick={handleOpenVault}>
                    {item.name}
                  </Typography>
                </div>
                <div className={classes.badgesContainter}>
                  <div className={classes.badges}>
                    {/*Network Image*/}
                    <img
                        alt={item.network}
                        src={require(`../../../../images/networks/${item.network}.svg`).default}
                        width={24}
                        height={24}
                        style={{width: '24px', height: '24px'}}
                    />
                    {/*Vault Tags*/}
                    <DisplayTags isBoosted={isBoosted} tags={item.tags} />
                  </div>
                </div>
              </div>
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
            {isBoosted && parseInt(priceInDolar.balance) === 0 && (
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
            {!isBoosted && (
              <div className={classes.centerSpace}>
                <div className={classes.stat}>
                  <Typography className={classes.label}>{t('DEPOSITED')}</Typography>

                  <ValueText value={tokensEarned} />

                  {parseFloat(priceInDolar.balance) > 0 && (
                    <Typography className={classes.label}>
                      <ValuePrice value={formatUsd(price)} />
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
                {isBoosted || parseFloat(priceInDolar.balance) > 0 ? (
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
                spacer: !isBoosted && parseFloat(priceInDolar.balance) > 0,
                isGovVault: item.isGovVault ?? false,
              } as any)}
            />
            {/*Rewards/Safety Score*/}
            {isGovVault ? (
              <div className={classes.centerSpace}>
                <div className={classes.stat}>
                  <Typography className={classes.label}>{t('Vault-Rewards')}</Typography>

                  <ValueText value={(rewardsEarned ?? '') + ` ${item.earnedToken}`} />
                  {parseFloat(priceInDolar.balance) > 0 && (
                    <Typography className={classes.label}>
                      <ValuePrice value={formatUsd(rewardPrice)} />
                    </Typography>
                  )}
                  {/* {parseFloat(priceInDolar.balance) > 0 ? (
                    <div className={classes.boostSpacer} />
                  ) : null} */}
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
                  {isBoosted || parseFloat(priceInDolar.balance) > 0 ? (
                    <div className={classes.boostSpacer} />
                  ) : null}
                </div>
              </div>
            )}

            {/*Open Vault*/}
            <div className={classes.centerSpaceOpen} style={{ padding: 0 }}>
              <Button onClick={handleOpenVault} size="large" className={classes.depositButton}>
                {isGovVault ? t('Vault-Open-Pool') : t('Vault-Open')}
              </Button>
            </div>
          </Grid>
        </div>
      </Grid>
    </div>
  );
};

export const Item = memo(_Item);
