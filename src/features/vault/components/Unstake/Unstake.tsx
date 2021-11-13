import {
  Box,
  Button,
  makeStyles,
  Typography,
  IconButton,
  FormControl,
  InputAdornment,
  InputBase,
} from '@material-ui/core';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { convertAmountToRawNumber, stripExtraDecimals } from '../../../../helpers/format';
import { isEmpty } from '../../../../helpers/utils';
import { reduxActions } from '../../../redux/actions';
import { Steps } from '../../../../components/Steps';
import CloseIcon from '@material-ui/icons/Close';
import { Card } from '../Card/Card';
import { CardHeader } from '../Card/CardHeader';
import { CardContent } from '../Card/CardContent';
import { CardTitle } from '../Card/CardTitle';
import { styles } from './styles';
import BigNumber from 'bignumber.js';
import { switchNetwork } from '../../../../helpers/switchNetwork';
import { UnstakeProps } from './UnstakeProps';

const useStyles = makeStyles(styles as any);
export const Unstake: React.FC<UnstakeProps> = ({
  item,
  balance,
  handleWalletConnect,
  formData,
  setFormData,
  updateItemData,
  resetFormData,
  closeModal,
}) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const t = useTranslation().t;
  const { wallet } = useSelector((state: any) => ({
    wallet: state.walletReducer,
  }));
  const [steps, setSteps] = React.useState({
    modal: false,
    currentStep: -1,
    items: [],
    finished: false,
  });
  const [isLoading, setIsLoading] = React.useState(true);

  const handleInput = val => {
    const value =
      parseFloat(val) > balance.balance
        ? balance.balance
        : parseFloat(val) < 0
        ? 0
        : stripExtraDecimals(val);
    setFormData({
      ...formData,
      withdraw: {
        amount: value,
        max: new BigNumber(value).minus(balance.balance).toNumber() === 0,
      },
    });
  };

  const handleMax = () => {
    if (balance.balance > 0) {
      setFormData({ ...formData, withdraw: { amount: balance.balance, max: true } });
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

  const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    boxShadow: 24,
    minWidth: '400px',
  };

  return (
    <React.Fragment>
      <Box sx={style}>
        <Card>
          <CardHeader className={classes.header}>
            <CardTitle titleClassName={classes.title} title={t('Stake-Modal-Title')} />
            <IconButton onClick={closeModal} aria-label="settings">
              <CloseIcon htmlColor="#6B7199" />
            </IconButton>
          </CardHeader>
          <CardContent className={classes.content}>
            <Box className={classes.inputContainer}>
              <Box className={classes.balances}>
                <Box className={classes.available}>
                  <Typography className={classes.label}>{t('Stake-Label-Available')}</Typography>
                  <Typography className={classes.value}>{balance.balance}</Typography>
                </Box>
                <Box className={classes.staked}>
                  <Typography className={classes.label}>{t('Stake-Label-Staked')}</Typography>
                  <Typography className={classes.value}>{balance.deposited}</Typography>
                </Box>
              </Box>
              <Box pt={2}>
                <FormControl variant="filled">
                  <InputBase
                    placeholder="0.00"
                    className={classes.input}
                    value={formData.deposit.amount}
                    onChange={e => handleInput(e.target.value)}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          className={classes.maxButton}
                          aria-label="max button"
                          onClick={handleMax}
                          edge="end"
                        >
                          {' '}
                          Max
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                </FormControl>
              </Box>
            </Box>
            {/*BUTTON */}
            <Box className={classes.btnSection}>
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
                    onClick={handleWithdraw}
                    className={classes.btnSubmit}
                    fullWidth={true}
                    disabled={formData.deposit.amount <= 0}
                  >
                    {t('Stake-Button-ConfirmStaking')}
                  </Button>
                )
              ) : (
                <Button
                  className={classes.btnSubmit}
                  fullWidth={true}
                  onClick={handleWalletConnect}
                >
                  {t('Network-ConnectWallet')}
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Steps item={item} steps={steps} handleClose={handleClose} />
    </React.Fragment>
  );
};
