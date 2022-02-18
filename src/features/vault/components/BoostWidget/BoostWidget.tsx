import React, { useState } from 'react';
import { Box, Button, makeStyles, Typography, Grid, Modal } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router';
import BigNumber from 'bignumber.js';
import AnimateHeight from 'react-animate-height';
import { styles } from './styles';
import { Stake } from '../Stake';
import { Unstake } from '../Unstake';
import { Popover } from '../../../../components/Popover/Popover';
import { Steps } from '../../../../components/Steps';
import { StakeCountdown } from '../StakeCountdown';
import { isEmpty } from '../../../../helpers/utils';
import { BIG_ZERO, byDecimals } from '../../../../helpers/format';
import { askForNetworkChange, askForWalletConnection } from '../../../data/actions/wallet';

const useStyles = makeStyles(styles as any);

export const BoostWidget = ({ isBoosted, boostedData, vaultBoosts }) => {
  const item = boostedData ?? (vaultBoosts.length > 0 ? vaultBoosts[0] : null);
  const stylesProps = {
    isBoosted,
  };
  const classes = useStyles(stylesProps);
  const t = useTranslation().t;
  const [filterOpen, setFilterOpen] = useState(false);
  const [dw, setDw] = React.useState('deposit');
  const dispatch = useDispatch();
  let { network }: any = useParams();

  const [inputModal, setInputModal] = React.useState(false);
  const [state, setState] = React.useState({
    balance: BIG_ZERO,
    deposited: BIG_ZERO,
    allowance: BIG_ZERO,
    poolPercentage: '0',
    rewards: BIG_ZERO,
  });

  const [formData, setFormData] = React.useState({
    deposit: { token: null, input: '', amount: BIG_ZERO, max: false },
    withdraw: { token: null, input: '', amount: BIG_ZERO, max: false },
  });
  /*
  React.useEffect(() => {
    async function fetchRewards() {
      await dispatch(reduxActions.balance.fetchBoostRewards(item, network));
    }
    if (isBoosted) {
      fetchRewards();
    }
  }, [dispatch, isBoosted, item, network]);
*/
  const handleClose = () => {
    resetFormData();
    setSteps({ modal: false, currentStep: -1, items: [], finished: false });
  };

  const closeInputModal = () => {
    setInputModal(false);
  };

  const handleWalletConnect = () => {
    if (!wallet.address) {
      dispatch(askForWalletConnection());
    }
  };

  const resetFormData = () => {
    setFormData({
      deposit: { ...formData.deposit, input: '', amount: BIG_ZERO, max: false },
      withdraw: { ...formData.withdraw, input: '', amount: BIG_ZERO, max: false },
    });
  };

  React.useEffect(() => {
    if (item) {
      setFormData({
        ...formData,
        deposit: {
          ...formData.deposit,
          token: item.token,
        },
        withdraw: {
          ...formData.withdraw,
          token: item.token,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  const { wallet, balance } = useSelector((state: any) => ({
    wallet: state.walletReducer,
    balance: state.balanceReducer,
  }));

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
      let currentTs = Date.now() / 1000;
      for (const boost of vaultBoosts) {
        let symbol = `${boost.token}${boost.id}Boost`;
        if (
          !isEmpty(balance.tokens[boost.network][symbol]) &&
          new BigNumber(balance.tokens[boost.network][symbol].balance).toNumber() > 0 &&
          parseInt(boost.periodFinish) <= currentTs
        ) {
          expiredBoostsWithBalance.push(boost);
          openFilter = true;
        }
      }
      setPastBoosts(expiredBoostsWithBalance);
      setFilterOpen(openFilter);
    }
  }, [wallet.address, vaultBoosts, state.balance, balance.tokens]);

  React.useEffect(() => {
    let amount = BIG_ZERO;
    let deposited = BIG_ZERO;
    let approved = BIG_ZERO;
    let poolPercentage: any = 0;
    let rewards = BIG_ZERO;

    if (
      item &&
      wallet.address &&
      !isEmpty(balance.tokens[network][item.token]) &&
      !isEmpty(balance.tokens[network][`${item.token}${item.id}Boost`])
    ) {
      let symbol = `${item.token}${item.id}Boost`;
      amount = byDecimals(
        new BigNumber(balance.tokens[network][item.token]?.balance),
        item.tokenDecimals
      );
      deposited = byDecimals(
        new BigNumber(balance.tokens[network][symbol]?.balance),
        item.tokenDecimals
      );

      approved = new BigNumber(balance.tokens[network][symbol].allowance[item.earnContractAddress]);

      if (!isEmpty(balance.rewards[item.earnedToken])) {
        rewards = byDecimals(
          new BigNumber(balance.rewards[item.earnedToken].balance),
          item.earnedTokenDecimals
        );
      }

      if (deposited.toNumber() > 0) {
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

  const handleClaim = () => {
    const steps = [];
    if (wallet.address) {
      if (item.network !== wallet.network) {
        dispatch(askForNetworkChange(item.network));
        return false;
      }

      steps.push({
        step: 'claim',
        message: t('Vault-TxnConfirm', { type: t('Claim-noun') }),
        action: () =>
          dispatch(
            /*walletActions.claim(
              item.network,
              item.earnContractAddress,
              state.rewards.toNumber()
            )*/ null
          ),
        pending: false,
        token: balance.tokens[item.network][item.earnedToken],
      });

      setSteps({ modal: true, currentStep: 0, items: steps, finished: false });
    } //if (wallet.address)
  }; //const handleWithdraw

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function depositWithdraw(deposit: string) {
    setDw(deposit);
    setInputModal(true);
  }

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

  const handleExit = boost => {
    const steps = [];
    if (wallet.address) {
      if (boost.network !== wallet.network) {
        dispatch(askForNetworkChange({ chainId: item.chainId }));
        return false;
      }

      steps.push({
        step: 'claim-unstake',
        message: t('Vault-TxnConfirm', { type: t('Claim-Unstake-noun') }),
        action: () =>
          /*dispatch(walletActions.exit(boost.network, boost.earnContractAddress, 0))*/ null,
        pending: false,
        token: balance.tokens[boost.network][boost.token],
      });

      setSteps({ modal: true, currentStep: 0, items: steps, finished: false });
    } //if (wallet.address)
  }; //const handleWithdraw

  return (
    <>
      {isBoosted && (
        <div className={classes.container}>
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
                {state.balance.toNumber() > 0 ? state.balance.toFixed(8) : '0'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography className={classes.body1}>
                {t('Boost-Balance-Staked', { mooToken: boostedData.token })}
              </Typography>
              <Typography className={classes.h2}>
                {state.deposited.toNumber() > 0 ? state.deposited.toFixed(8) : '0'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography className={classes.body1}>{t('Boost-Rewards')}</Typography>
              <Typography className={classes.h2}>
                {state.rewards.toNumber() > 0 ? state.rewards.toFixed(8) : '0'}{' '}
                {boostedData.earnedToken}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography className={classes.body1}>{t('Boost-Ends')}</Typography>
              <Typography className={classes.countDown}>
                <StakeCountdown periodFinish={boostedData.periodFinish} />
              </Typography>
            </Grid>
          </Grid>

          <Button
            disabled={false}
            className={classes.button}
            onClick={() => depositWithdraw('deposit')}
            fullWidth={true}
          >
            {t('Boost-Button-Vault')}
          </Button>
          <Button className={classes.button} onClick={handleClaim} fullWidth={true}>
            {t('Boost-Button-Withdraw')}
          </Button>
          <Button className={classes.button} onClick={() => handleExit(item)} fullWidth={true}>
            {t('Boost-Button-Claim-Unstake')}
          </Button>
          <Button
            onClick={() => depositWithdraw('unstake')}
            className={classes.button}
            fullWidth={true}
          >
            {t('Boost-Button-Unestake')}
          </Button>

          <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            open={inputModal}
            onClose={() => setInputModal(false)}
          >
            <>
              {dw === 'deposit' ? (
                <Stake
                  closeModal={closeInputModal}
                  item={item}
                  balance={state}
                  handleWalletConnect={handleWalletConnect}
                  formData={formData}
                  setFormData={setFormData}
                  resetFormData={resetFormData}
                />
              ) : (
                <Unstake
                  closeModal={closeInputModal}
                  item={item}
                  balance={state}
                  handleWalletConnect={handleWalletConnect}
                  formData={formData}
                  setFormData={setFormData}
                  resetFormData={resetFormData}
                />
              )}
            </>
          </Modal>
        </div>
      )}
      {filterOpen && (
        <div className={classes.containerExpired} hidden={!filterOpen}>
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
          <AnimateHeight duration={500} height={filterOpen ? 'auto' : 0}>
            {pastBoosts.map((boost, key) => (
              <div className={classes.expiredBoostContainer} key={boost.id}>
                <Typography className={classes.h2} style={{ textTransform: 'none' }}>
                  {boost.name}&nbsp;{t('Filter-Boost')}
                </Typography>
                <Button
                  onClick={() => handleExit(boost)}
                  disabled={false}
                  className={classes.button}
                  style={{ marginBottom: 0 }}
                  fullWidth={true}
                >
                  {t('Boost-Button-Claim-Unstake')}
                </Button>
              </div>
            ))}
          </AnimateHeight>
        </div>
      )}
      {(isBoosted || filterOpen) && (
        <Steps vaultId={item.id} steps={steps} handleClose={handleClose} />
      )}
    </>
  );
};
