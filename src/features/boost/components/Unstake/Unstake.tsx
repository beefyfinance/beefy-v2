import React from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import InputBase from '@material-ui/core/InputBase';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Loader } from '../../../../components/loader';
import {
  byDecimals,
  convertAmountToRawNumber,
  stripExtraDecimals,
} from '../../../../helpers/format';
import { isEmpty } from '../../../../helpers/utils';
import { AssetsImage } from '../../../../components/AssetsImage';
import { reduxActions } from '../../../redux/actions';
import { Steps } from '../../../../components/Steps';
import { styles } from '../../styles';
import BigNumber from 'bignumber.js';
import { switchNetwork } from '../../../../helpers/switchNetwork';
import { UnstakeProps } from './UnstakeProps';

const useStyles = makeStyles(styles as any);
export const Unstake: React.FC<UnstakeProps> = ({
  item,
  handleWalletConnect,
  formData,
  setFormData,
  updateItemData,
  resetFormData,
}) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const t = useTranslation().t;
  const { wallet, balance } = useSelector((state: any) => ({
    wallet: state.walletReducer,
    balance: state.balanceReducer,
  }));
  const [state, setState] = React.useState({ balance: 0, wallet: 0 });
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
      withdraw: { amount: value, max: new BigNumber(value).minus(state.balance).toNumber() === 0 },
    });
  };

  const handleMax = () => {
    if (state.balance > 0) {
      setFormData({ ...formData, withdraw: { amount: state.balance, max: true } });
    }
  };

  const handleWithdraw = () => {
    const steps = [];
    if (wallet.address) {
      if (item.network !== wallet.network) {
        dispatch(reduxActions.wallet.setNetwork(item.network));
        return false;
      }
      const amount = new BigNumber(formData.withdraw.amount).toFixed(8);
      steps.push({
        step: 'withdraw',
        message: t('Vault-TxnConfirm', { type: t('Unstake-noun') }),
        action: () =>
          dispatch(
            reduxActions.wallet.unstake(
              item.network,
              item.earnContractAddress,
              convertAmountToRawNumber(amount, item.tokenDecimals)
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
    }
    setState({ balance: deposited, wallet: amount });
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
              <Loader message={''} line={true} />
            ) : (
              <Typography variant={'body1'}>
                {state.wallet} {item.token}
              </Typography>
            )}
            <Typography variant={'body2'}>{t('Stake-Balance')}</Typography>
          </Box>
          <Box>
            {isLoading ? (
              <Loader message={''} line={true} />
            ) : (
              <Typography variant={'body1'}>{state.balance}</Typography>
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
              value={formData.withdraw.amount}
              onChange={e => handleInput(e.target.value)}
            />
            <Button onClick={handleMax}>{t('Transact-Max')}</Button>
          </Paper>
        </Box>
        <Box mt={2}>
          {wallet.address ? (
            item.network !== wallet.network ? (
              <>
                <Button
                  onClick={() => switchNetwork(item.network, dispatch)}
                  className={classes.btnSubmit}
                  fullWidth={true}
                >
                  {t('Network-Change', { network: item.network.toUpperCase() })}
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleWithdraw}
                  className={classes.btnSubmit}
                  fullWidth={true}
                  disabled={formData.withdraw.amount <= 0}
                >
                  {t('Stake-Button-ConfirmUnstaking')}
                </Button>
              </>
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
