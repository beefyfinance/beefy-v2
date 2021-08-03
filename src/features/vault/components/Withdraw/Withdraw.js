import { Box, Button, InputBase, makeStyles, Paper, Typography } from '@material-ui/core';
import { ShoppingBasket } from '@material-ui/icons';
import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import styles from '../styles';
import Loader from '../../../../components/loader';
import {
  byDecimals,
  convertAmountToRawNumber,
  stripExtraDecimals,
} from '../../../../helpers/format';
import { isEmpty } from '../../../../helpers/utils';
import reduxActions from '../../../redux/actions';
import Steps from '../Steps';
import AssetsImage from '../../../../components/AssetsImage';
import BoostWidget from '../BoostWidget';
import FeeBreakdown from '../FeeBreakdown';

const useStyles = makeStyles(styles);

const Withdraw = ({
  item,
  handleWalletConnect,
  formData,
  setFormData,
  updateItemData,
  resetFormData,
}) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { wallet, balance } = useSelector(state => ({
    wallet: state.walletReducer,
    balance: state.balanceReducer,
  }));
  const [state, setState] = React.useState({ balance: 0 });
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
      withdraw: {
        amount: value,
        max: new BigNumber(value).minus(state.balance).toNumber() === 0,
      },
    });
  };

  const handleMax = () => {
    if (state.balance > 0) {
      setFormData({
        ...formData,
        withdraw: { amount: state.balance, max: true },
      });
    }
  };

  const handleWithdraw = () => {
    const steps = [];
    if (wallet.address) {
      if (item.network !== wallet.network) {
        dispatch(reduxActions.wallet.setNetwork(item.network));
        return false;
      }
      const amount = new BigNumber(formData.withdraw.amount)
        .dividedBy(byDecimals(item.pricePerFullShare, item.tokenDecimals))
        .toFixed(8);
      steps.push({
        step: 'withdraw',
        message: 'Confirm withdraw transaction on wallet to complete.',
        action: () =>
          dispatch(
            reduxActions.wallet.withdraw(
              item.network,
              item.earnContractAddress,
              convertAmountToRawNumber(amount, item.tokenDecimals),
              formData.withdraw.max
            )
          ),
        pending: false,
      });

      setSteps({
        modal: true,
        currentStep: 0,
        items: steps,
        finished: false,
      });
    }
  };

  const handleClose = () => {
    updateItemData();
    resetFormData();
    setSteps({ modal: false, currentStep: -1, items: [], finished: false });
  };

  React.useEffect(() => {
    let amount = 0;
    if (wallet.address && !isEmpty(balance.tokens[item.earnedToken])) {
      amount = byDecimals(
        new BigNumber(balance.tokens[item.earnedToken].balance).multipliedBy(
          byDecimals(item.pricePerFullShare)
        ),
        item.tokenDecimals
      ).toFixed(8);
    }
    setState({ balance: amount });
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
        <Typography className={classes.balanceText}>Deposited:</Typography>
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
              <Button endIcon={<ShoppingBasket />}>Buy Token</Button>
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
              value={formData.withdraw.amount}
              onChange={e => handleInput(e.target.value)}
            />
            <Button onClick={handleMax}>Max</Button>
          </Paper>
        </Box>
        <FeeBreakdown withdrawalFee={item.withdrawalFee} depositFee={item.depositFee} />
        <Box mt={2}>
          {wallet.address ? (
            <Button
              onClick={handleWithdraw}
              className={classes.btnSubmit}
              fullWidth={true}
              disabled={formData.withdraw.amount <= 0}
            >
              {item.network !== wallet.network
                ? 'Change Network'
                : formData.withdraw.max
                ? 'Withdraw All'
                : 'Withdraw'}
            </Button>
          ) : (
            <Button className={classes.btnSubmit} fullWidth={true} onClick={handleWalletConnect}>
              Connect Wallet
            </Button>
          )}
        </Box>
      </Box>
      <BoostWidget balance={0} onClick={() => {}} variant="unstake" />
      <Steps item={item} steps={steps} handleClose={handleClose} />
    </React.Fragment>
  );
};

export default Withdraw;
