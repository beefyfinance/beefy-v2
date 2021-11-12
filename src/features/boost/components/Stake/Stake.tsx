import { Box, Button, InputBase, makeStyles, Paper, Typography } from '@material-ui/core';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { styles } from '../../styles';
import BigNumber from 'bignumber.js';
import { Loader } from '../../../../components/loader';
import { byDecimals, convertAmountToRawNumber, stripExtraDecimals } from '../../../../helpers/format';
import { isEmpty } from '../../../../helpers/utils';
import { Steps } from '../../../../components/Steps';
import { AssetsImage } from '../../../../components/AssetsImage';
import { switchNetwork } from '../../../../helpers/switchNetwork';
import { reduxActions } from '../../../redux/actions';
import { StakeProps } from './StakeProps';

const useStyles = makeStyles(styles as any);
export const Stake: React.FC<StakeProps> = ({
  formData,
  setFormData,
  item,
  handleWalletConnect,
  updateItemData,
  resetFormData,
}) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { wallet, balance } = useSelector((state: any) => ({
    wallet: state.walletReducer,
    balance: state.balanceReducer,
  }));
  const t = useTranslation().t;

  const [state, setState] = React.useState({ balance: 0, deposited: 0, allowance: 0 });
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
        message: t('Vault-TxnConfirm', { type: t('Stake-noun') }),
        action: () =>
          dispatch(
            reduxActions.wallet.stake(
              item.network,
              item.earnContractAddress,
              convertAmountToRawNumber(formData.deposit.amount, item.tokenDecimals)
            )
          ),
        pending: false,
      });

      setSteps({ modal: true, currentStep: 0, items: steps, finished: false });
    }
  };

  const handleClose = () => {
    updateItemData();
    resetFormData();
    setSteps({ modal: false, currentStep: -1, items: [], finished: false });
  };

  React.useEffect(() => {
    let amount: any = 0;
    let approved: any = 0;
    let deposited: any = 0;

    if (wallet.address && !isEmpty(balance.tokens[item.network][item.token])) {
      amount = byDecimals(
        new BigNumber(balance.tokens[item.network][item.token].balance),
        item.tokenDecimals
      ).toFixed(8);
      deposited = byDecimals(
        new BigNumber(balance.tokens[item.token + item.id + 'Boost'].balance),
        item.tokenDecimals
      ).toFixed(8);
      approved = balance.tokens[item.token + item.id + 'Boost'].allowance[item.earnContractAddress];
    }
    setState({ balance: amount, deposited: deposited, allowance: approved });
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
        <Box className={classes.balanceContainer} display="flex" alignItems="center">
          <Box flexGrow={1} pl={1} lineHeight={0}>
            {isLoading ? (
              <Loader message={""} line={true} />
            ) : (
              <Typography variant={'body1'}>
                {state.balance} {item.token}
              </Typography>
            )}
            <Typography variant={'body2'}>{t('Stake-Balance')}</Typography>
          </Box>
          <Box>
            {isLoading ? (
              <Loader message={""} line={true} />
            ) : (
              <Typography variant={'body1'}>{state.deposited}</Typography>
            )}
            <Typography align={'right'} variant={'body2'}>
              {t('Stake-Staked')}
            </Typography>
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
        <Box mt={2}>
          {item.status !== 'active' ? (
            <Button className={classes.btnSubmit} fullWidth={true} disabled={true}>
              {t('Deposit-Disabled')}
            </Button>
          ) : wallet.address ? (
            item.network !== wallet.network ? (
              <Button
                onClick={() => switchNetwork(item.network, dispatch)}
                className={classes.btnSubmit}
                fullWidth={true}
              >
                {t('Network-Change', { network: item.network.toUpperCase() })}
              </Button>
            ) : (
              <Button
                onClick={handleDeposit}
                className={classes.btnSubmit}
                fullWidth={true}
                disabled={formData.deposit.amount <= 0}
              >
                {t('Stake-Button-ConfirmStaking')}
              </Button>
            )
          ) : (
            <Button className={classes.btnSubmit} fullWidth={true} onClick={handleWalletConnect}>
              {t('Network-ConnectWallet')}
            </Button>
          )}
        </Box>
      </Box>
      <Steps item={item} steps={steps} handleClose={handleClose} />
    </React.Fragment>
  );
};
