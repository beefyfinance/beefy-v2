import React, { useState } from 'react';
import { Box, Button, makeStyles, Typography, Grid } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router';
import BigNumber from 'bignumber.js';
import AnimateHeight from 'react-animate-height';
import { reduxActions } from '../../../redux/actions';
import { styles } from './styles';
import { Popover } from '../../../../components/Popover/Popover';
import { StakeCountdown } from '../StakeCountdown';
import { isEmpty } from '../../../../helpers/utils';
import { byDecimals } from '../../../../helpers/format';

const useStyles = makeStyles(styles as any);
export const BoostWidget = ({ isBoosted, boostedData, vaultBoosts }) => {
  const item = boostedData;
  const stylesProps = {
    isBoosted,
  };
  const classes = useStyles(stylesProps);
  const t = useTranslation().t;
  const [filterOpen, setFilterOpen] = useState(false);
  const dispatch = useDispatch();
  let { network }: any = useParams();

  const [state, setState] = React.useState({
    balance: 0,
    deposited: 0,
    allowance: 0,
    poolPercentage: 0,
    rewards: 0,
  });

  
  const { wallet, balance } = useSelector((state: any) => ({
    wallet: state.walletReducer,
    balance: state.balanceReducer,
  }));
  
  const [formData, setFormData] = React.useState({
    deposit: { amount: '', max: false },
    withdraw: { amount: '', max: false },
  });

  const [steps, setSteps] = React.useState({
    modal: false,
    currentStep: -1,
    items: [],
    finished: false,
  });

  const [pastBoosts, setPastBoosts] = React.useState([]);

  React.useEffect(() => {
    if (wallet.address) {
      let expiredBoostsWithBalance = [];
      let openFilter = false;
      for (const boost of vaultBoosts) {
        let symbol = `${boost.token}${boost.id}Boost`;
        if (
          !isEmpty(balance.tokens[boost.network][symbol]) &&
          new BigNumber(balance.tokens[boost.network][symbol].balance).toNumber() > 0
        ) {
          expiredBoostsWithBalance.push(boost);
          openFilter = true;
        }
      }
      setPastBoosts(expiredBoostsWithBalance);
      setFilterOpen(openFilter);
    }
    
  },[wallet.address, vaultBoosts, state.balance])

  React.useEffect(() => {
    if (item && wallet.address) {
      dispatch(reduxActions.balance.fetchBoostBalances(item, network)); // TODO add network
      dispatch(reduxActions.balance.fetchBoostRewards(item, network));
    }
  }, [dispatch, item, network, wallet.address]);

  React.useEffect(() => {
    if (item) {
      setInterval(() => {
        dispatch(reduxActions.vault.fetchBoosts(item));
        dispatch(reduxActions.balance.fetchBoostBalances(item, network));
        dispatch(reduxActions.balance.fetchBoostRewards(item, network));
      }, 60000);
    }
  }, [item, dispatch, network]);

  React.useEffect(() => {
    let amount: any = 0;
    let deposited: any = 0;
    let approved: any = 0;
    let poolPercentage: any = 0;
    let rewards: any = 0;

    if (item && wallet.address && !isEmpty(balance.tokens[network][item.token])) {
      amount = byDecimals(
        new BigNumber(balance.tokens[network][item.token]?.balance),
        item.tokenDecimals
      ).toFixed(8);
      deposited = byDecimals(
        new BigNumber(balance.tokens[network][item.token + item.id + 'Boost']?.balance),
        item.tokenDecimals
      ).toFixed(8);
      approved = balance.tokens[network][item.token].allowance[item.earnContractAddress];

      if (!isEmpty(balance.rewards[item.earnedToken])) {
        rewards = byDecimals(
          new BigNumber(balance.rewards[item.earnedToken].balance),
          item.earnedTokenDecimals
        ).toFixed(8);
      }

      if (deposited > 0) {
        poolPercentage = (
          (Math.floor(new BigNumber(deposited).toNumber() * 1000000000) /
            1000000000 /
            item.staked) *
          100
        ).toFixed(4);
      }
    }
    setState({
      balance: amount,
      deposited: deposited,
      allowance: approved,
      poolPercentage: poolPercentage,
      rewards: rewards,
    });
  }, [wallet.address, item, balance, network]);

  React.useEffect(() => {
    const index = steps.currentStep;
    if (!isEmpty(steps.items[index]) && steps.modal) {
      const items = steps.items;
      if (!items[index].pending) {
        items[index].pending = true;
        items[index].action();
        setSteps({ ...steps, items: items });
      } else {
        if (wallet.action.result === 'success' && !steps.finished) {
          const nextStep = index + 1;
          if (!isEmpty(items[nextStep])) {
            setSteps({ ...steps, currentStep: nextStep });
          } else {
            setSteps({ ...steps, finished: true });
          }
        }
      }
    }
  }, [steps, wallet.action]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const buttonProps: any = {
    className: classes.blockBtn,
    style: { maxWidth: '30px', maxHeight: '30px', minWidth: '30px', minHeight: '30px' },
    value: filterOpen,
    selected: filterOpen,
    children: !filterOpen ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        className="bi bi-chevron-down"
        viewBox="0 0 16 16"
      >
        <path
          fill-rule="evenodd"
          d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
        />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        className="bi bi-chevron-up"
        viewBox="0 0 16 16"
      >
        <path
          fill-rule="evenodd"
          d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"
        />
      </svg>
    ),
    onClick: () => {
      setFilterOpen(!filterOpen);
    },
  };

  return (
    <>
      {isBoosted && (
        <div className={classes.container}>
          {console.log(boostedData)}
          <Box display="flex" alignItems="center">
            <img
              alt="fire"
              src={require(`../../../../images/fire.png`).default}
              className={classes.boostImg}
            />
            <Typography className={classes.h1}>{t('Boost-Noun')}</Typography>
            <Box style={{ marginLeft: '8px' }}>
              <Popover
                title={t('Boost-WhatIs')}
                content={t('Boost-Explain')}
                size="md"
                placement="top-end"
              />
            </Box>
          </Box>
          <Grid container>
            <Grid item xs={6}>
              <Typography className={classes.body1}>
                {t('Boost-Balance', { mooToken: boostedData.token })}
              </Typography>
              <Typography className={classes.h2}>
                {state.balance > 0 ? state.balance : '0'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography className={classes.body1}>
                {t('Boost-Balance-Staked', { mooToken: boostedData.token })}
              </Typography>
              <Typography className={classes.h2}>
                {state.deposited > 0 ? state.deposited : '0'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography className={classes.body1}>{t('Boost-Rewards')}</Typography>
              <Typography className={classes.h2}>
                {state.rewards > 0 ? state.rewards : '0'} {boostedData.earnedToken}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography className={classes.body1}>{t('Boost-Ends')}</Typography>
              <Typography className={classes.countDown}>
                <StakeCountdown periodFinish={boostedData.periodFinish} />
              </Typography>
            </Grid>
          </Grid>

          <Button disabled={false} className={classes.button} fullWidth={true}>
            {t('Boost-Button-Vault')}
          </Button>
          <Button disabled={true} className={classes.button} fullWidth={true}>
            {t('Boost-Button-Withdraw')}
          </Button>
          <Button disabled={true} className={classes.button} fullWidth={true}>
            {t('Boost-Button-Claim')}
          </Button>
          <Button disabled={true} className={classes.button} fullWidth={true}>
            {t('Boost-Button-Claim-Unstake')}
          </Button>
        </div>
      )}
      <div className={classes.containerExpired}>
        <Box display="flex" alignItems="center" style={{ marginBottom: '24px' }}>
          <img
            alt="fire"
            src={require(`../../../../images/fire.png`).default}
            className={classes.boostImg}
          />
          <Typography className={classes.h1white}>{t('Boost-Expired')}</Typography>
          &nbsp;
          <Typography className={classes.h1}>{t('Boost-Noun')}</Typography>
          <Button></Button>
        </Box>
        {/* TODO: Map to expired boosts */}
        <AnimateHeight duration={500} height={filterOpen ? 'auto' : 0}>
          {pastBoosts.map((boost, key) => (
            <div className={classes.expiredBoostContainer} key={boost.id}>
              <Typography className={classes.h2} style={{ textTransform: 'none' }}>
                {boost.name}&nbsp;{t('Filter-Boost')}
              </Typography>
              <Button
                disabled={false}
                className={classes.button}
                style={{ marginBottom: 0 }}
                fullWidth={true}
              >
                {t('Boost-Button-Claim-Unstake')}
              </Button>
            </div>
          ))}
          {/* <div className={classes.expiredBoostContainer}>
            <Typography className={classes.h2} style={{ textTransform: 'none' }}>
              POTS&nbsp;{t('Filter-Boost')}
            </Typography>
            <Button
              disabled={false}
              className={classes.button}
              style={{ marginBottom: 0 }}
              fullWidth={true}
            >
              {t('Boost-Button-Claim-Unstake')}
            </Button>
          </div>
          <div className={classes.expiredBoostContainer}>
            <Typography className={classes.h2} style={{ textTransform: 'none' }}>
              PACOCA&nbsp;{t('Filter-Boost')}
            </Typography>
            <Button
              disabled={false}
              className={classes.button}
              style={{ marginBottom: 0 }}
              fullWidth={true}
            >
              {t('Boost-Button-Claim-Unstake')}
            </Button>
          </div> */}
        </AnimateHeight>
      </div>
    </>
  );
};
