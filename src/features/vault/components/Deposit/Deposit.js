import { Box, Button, InputBase, makeStyles, Paper, Typography } from '@material-ui/core';
import { ShoppingBasket } from '@material-ui/icons';
import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import styles from '../styles';
import BigNumber from 'bignumber.js';
import Loader from 'components/loader';
import { byDecimals, convertAmountToRawNumber, stripExtraDecimals } from 'helpers/format';
import { isEmpty } from 'helpers/utils';
import reduxActions from 'features/redux/actions';
import Steps from '../Steps';
import AssetsImage from 'components/AssetsImage';
import BoostWidget from '../BoostWidget';
import FeeBreakdown from '../FeeBreakdown';

const useStyles = makeStyles(styles);

const Deposit = ({
  formData,
  setFormData,
  item,
  handleWalletConnect,
  updateItemData,
  resetFormData,
}) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { wallet, balance } = useSelector(state => ({
    wallet: state.walletReducer,
    balance: state.balanceReducer,
  }));
  const t = useTranslation().t;

  const [state, setState] = React.useState({ balance: 0, allowance: 0 });
  const [steps, setSteps] = React.useState({
    modal: false,
    currentStep: -1,
    items: [],
    finished: false,
  });
  const [isLoading, setIsLoading] = React.useState(true);

  const handleInput = val => {
    const value =
      parseFloat(val) > state.balance
        ? state.balance
        : parseFloat(val) < 0
        ? 0
        : stripExtraDecimals(val);
    setFormData({
      ...formData,
      deposit: { amount: value, max: new BigNumber(value).minus(state.balance).toNumber() === 0 },
    });
  };

  const handleMax = () => {
    if (state.balance > 0) {
      setFormData({ ...formData, deposit: { amount: state.balance, max: true } });
    }
  };

  const handleDeposit = () => {
    const steps = [];
    if (wallet.address) {
      if (item.network !== wallet.network) {
        dispatch(reduxActions.wallet.setNetwork(item.network));
        return false;
      }
      if (!state.allowance) {
        steps.push({
          step: 'approve',
          message: t('Vault-ApproveMsg'),
          action: () =>
            dispatch(
              reduxActions.wallet.approval(
                item.network,
                item.tokenAddress,
                item.earnContractAddress
              )
            ),
          pending: false,
        });
      }

      steps.push({
        step: 'deposit',
        message: t('Vault-TxnConfirm', { type: t('Deposit-noun') }),
        action: () =>
          dispatch(
            reduxActions.wallet.deposit(
              item.network,
              item.earnContractAddress,
              convertAmountToRawNumber(formData.deposit.amount, item.tokenDecimals),
              formData.deposit.max
            )
          ),
        pending: false,
      });

      setSteps({ modal: true, currentStep: 0, items: steps, finished: false });
    } //if (wallet.address)
  }; //const handleDeposit

  const handleClose = () => {
    updateItemData();
    resetFormData();
    setSteps({ modal: false, currentStep: -1, items: [], finished: false });
  };

  React.useEffect(() => {
    let amount = 0;
    let approved = 0;
    if (wallet.address && !isEmpty(balance.tokens[item.token])) {
      amount = byDecimals(
        new BigNumber(balance.tokens[item.token].balance),
        item.tokenDecimals
      ).toFixed(8);
      approved = balance.tokens[item.token].allowance[item.earnContractAddress];
    }
    setState({ balance: amount, allowance: approved });
  }, [wallet.address, item, balance]);

  React.useEffect(() => {
    setIsLoading(balance.isBalancesLoading);
  }, [balance.isBalancesLoading]);

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

  return (
    <React.Fragment>
      <Box p={3}>
        <Typography className={classes.balanceText}>{t('Vault-Wallet')}</Typography>
        <Box className={classes.balanceContainer} display="flex" alignItems="center">
          <Box lineHeight={0}>
            <AssetsImage img={item.logo} assets={item.assets} alt={item.name} />
          </Box>
          <Box flexGrow={1} pl={1} lineHeight={0}>
            {isLoading ? (
              <Loader line={true} />
            ) : (
              <Typography variant={'body1'}>
                {state.balance} {item.token}
              </Typography>
            )}
          </Box>
          <Box>
            <Link
              to={{ pathname: item.buyTokenUrl }}
              target="_blank"
              className={classes.btnSecondary}
            >
              <Button endIcon={<ShoppingBasket />}>{t('Transact-BuyTkn')}</Button>
            </Link>
          </Box>
        </Box>
        <Box className={classes.inputContainer}>
          <Paper component="form" className={classes.root}>
            <Box className={classes.inputLogo}>
              <AssetsImage img={item.logo} assets={item.assets} alt={item.name} />
            </Box>
            <InputBase
              placeholder="0.00"
              value={formData.deposit.amount}
              onChange={e => handleInput(e.target.value)}
            />
            <Button onClick={handleMax}>{t('Transact-Max')}</Button>
          </Paper>
        </Box>
        <FeeBreakdown withdrawalFee={item.withdrawalFee} depositFee={item.depositFee} />
        <Box mt={2}>
          {wallet.address ? (
            <Button
              onClick={handleDeposit}
              className={classes.btnSubmit}
              fullWidth={true}
              disabled={formData.deposit.amount <= 0}
            >
              {item.network !== wallet.network
                ? t('Network-Change')
                : formData.deposit.max
                ? t('Deposit-All')
                : t('Deposit-Verb')}
            </Button>
          ) : (
            <Button className={classes.btnSubmit} fullWidth={true} onClick={handleWalletConnect}>
              {t('Network-ConnectWallet')}
            </Button>
          )}
        </Box>
      </Box>
      <BoostWidget
        balance={0 /*TODO: fix parameters*/}
        s_stake={
          t('Boost-Stake', { mooToken: 'mooToken' }) /*TODO: replace 'mooToken' with real mooName*/
        }
        onClick={() => {}}
      />
      <Steps item={item} steps={steps} handleClose={handleClose} />
    </React.Fragment>
  ); //return
}; //const Deposit

export default Deposit;
