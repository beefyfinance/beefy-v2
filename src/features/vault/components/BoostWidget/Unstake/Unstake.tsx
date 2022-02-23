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
import {
  BIG_ZERO,
  convertAmountToRawNumber,
  formatBigNumberSignificant,
} from '../../../../../helpers/format';
import { isEmpty } from '../../../../../helpers/utils';
import { Steps } from '../../../../../components/Steps';
import CloseIcon from '@material-ui/icons/Close';
import { Card } from '../../Card/Card';
import { CardHeader } from '../../Card/CardHeader';
import { CardContent } from '../../Card/CardContent';
import { CardTitle } from '../../Card/CardTitle';
import { styles } from './styles';
import BigNumber from 'bignumber.js';
import { askForNetworkChange } from '../../../../data/actions/wallet';

const useStyles = makeStyles(styles as any);
export const Unstake = ({
  item,
  balance,
  handleWalletConnect,
  formData,
  setFormData,
  resetFormData,
  closeModal,
}: {
  item: any;
  formData: any;
  setFormData: any;
  balance: any;
  handleWalletConnect: any;
  resetFormData: any;
  closeModal: () => void;
}) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const t = useTranslation().t;

  const { wallet, tokens } = useSelector((state: any) => ({
    wallet: state.walletReducer,
    tokens: state.balanceReducer.tokens[item.network],
  }));
  const [steps, setSteps] = React.useState({
    modal: false,
    currentStep: -1,
    items: [],
    finished: false,
  });

  // const handleInput = val => {
  //   const value =
  //     parseFloat(val) > balance.balance
  //       ? balance.balance
  //       : parseFloat(val) < 0
  //       ? 0
  //       : stripExtraDecimals(val);
  //   setFormData({
  //     ...formData,
  //     withdraw: {
  //       amount: value,
  //       max: new BigNumber(value).minus(balance.balance).toNumber() === 0,
  //     },
  //   });
  // };

  const handleInput = val => {
    const input = val.replace(/[,]+/, '').replace(/[^0-9.]+/, '');

    let max = false;

    let value = new BigNumber(input).decimalPlaces(
      tokens[formData.withdraw.token].decimals,
      BigNumber.ROUND_DOWN
    );

    if (value.isNaN() || value.isLessThanOrEqualTo(0)) {
      value = BIG_ZERO;
    }

    if (value.isGreaterThanOrEqualTo(balance.deposited)) {
      value = balance.deposited;
      max = true;
    }

    const formattedInput = (() => {
      if (value.isEqualTo(input)) return input;
      if (input === '') return '';
      if (input === '.') return `0.`;
      return formatBigNumberSignificant(value);
    })();

    setFormData({
      ...formData,
      withdraw: {
        ...formData.withdraw,
        input: formattedInput,
        amount: value,
        max: max,
      },
    });
  };

  const handleMax = () => {
    if (balance.deposited > 0) {
      setFormData({
        ...formData,
        withdraw: {
          ...formData.withdraw,
          input: formatBigNumberSignificant(balance.deposited),
          amount: balance.deposited,
          max: true,
        },
      });
    }
  };

  const handleClose = () => {
    resetFormData();
    setSteps({ modal: false, currentStep: -1, items: [], finished: false });
  };

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

  const handleUnstake = () => {
    const steps = [];
    if (wallet.address) {
      if (item.network !== wallet.network) {
        dispatch(askForNetworkChange({ chainId: item.chainId }));
        return false;
      }

      const amount = convertAmountToRawNumber(
        formData.withdraw.amount,
        tokens[formData.withdraw.token].decimals
      );

      steps.push({
        step: 'unstake',
        message: t('Vault-TxnConfirm', { type: t('Unstake-noun') }),
        action: () =>
          /*dispatch(walletActions.unstake(item.network, item.earnContractAddress, amount))*/ null,
        pending: false,
        token: tokens[formData.deposit.token],
        amount,
      });

      setSteps({ modal: true, currentStep: 0, items: steps, finished: false });
    } //if (wallet.address)
  };

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
            <CardTitle titleClassName={classes.title} title={t('Unstake-Modal-Title')} />
            <IconButton className={classes.removeHover} onClick={closeModal} aria-label="settings">
              <CloseIcon htmlColor="#8A8EA8" />
            </IconButton>
          </CardHeader>
          <CardContent className={classes.content}>
            <Box className={classes.inputContainer}>
              <Box className={classes.balances}>
                <Box className={classes.available}>
                  <Typography className={classes.label}>{t('Stake-Label-Available')}</Typography>
                  <Typography className={classes.value}>
                    {formatBigNumberSignificant(balance.balance)}
                  </Typography>
                </Box>
                <Box className={classes.staked}>
                  <Typography className={classes.label}>{t('Stake-Label-Staked')}</Typography>
                  <Typography className={classes.value}>
                    {formatBigNumberSignificant(balance.deposited)}
                  </Typography>
                </Box>
              </Box>
              <Box pt={2}>
                <FormControl className={classes.width} variant="filled">
                  <InputBase
                    placeholder="0.00"
                    className={classes.input}
                    value={formData.withdraw.input}
                    onChange={e => handleInput(e.target.value)}
                    endAdornment={
                      <InputAdornment className={classes.positionButton} position="end">
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
                    onClick={() => dispatch(askForNetworkChange({ chainId: item.chainId }))}
                    className={classes.btnSubmit}
                    fullWidth={true}
                  >
                    {t('Network-Change', { network: item.network.toUpperCase() })}
                  </Button>
                ) : (
                  <Button
                    onClick={handleUnstake}
                    className={classes.btnSubmit}
                    fullWidth={true}
                    disabled={formData.withdraw.amount <= 0}
                  >
                    {t('Stake-Button-ConfirmUnstaking')}
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

      <Steps vaultId={item.id} steps={steps} handleClose={handleClose} />
    </React.Fragment>
  );
};
