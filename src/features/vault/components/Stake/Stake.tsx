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
import { styles } from './styles';
import BigNumber from 'bignumber.js';
import CloseIcon from '@material-ui/icons/Close';
import { Card } from '../Card/Card';
import { CardHeader } from '../Card/CardHeader';
import { CardContent } from '../Card/CardContent';
import { CardTitle } from '../Card/CardTitle';
import { convertAmountToRawNumber } from '../../../../helpers/format';
import { isEmpty } from '../../../../helpers/utils';
import { Steps } from '../../../../components/Steps';
import { switchNetwork } from '../../../../helpers/switchNetwork';
import { reduxActions } from '../../../redux/actions';
import { StakeProps } from './StakeProps';

(BigNumber.prototype as any).significant = function (digits) {
  const number = this.toFormat({
    prefix: '',
    decimalSeparator: '.',
    groupSeparator: '',
    groupSize: 0,
    secondaryGroupSize: 0,
  });
  if (number.length <= digits + 1) {
    return number;
  }
  const [wholes, decimals] = number.split('.');
  if (wholes.length >= digits) {
    return wholes;
  }
  const pattern = new RegExp(`^[0]*[0-9]{0,${digits - (wholes === '0' ? 0 : wholes.length)}}`);
  return `${wholes}.${decimals.match(pattern)[0]}`;
};

const useStyles = makeStyles(styles as any);
export const Stake: React.FC<StakeProps> = ({
  formData,
  setFormData,
  item,
  handleWalletConnect,
  updateItemData,
  resetFormData,
  balance,
  closeModal,
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

  const handleInput = val => {
    const input = val.replace(/[,]+/, '').replace(/[^0-9.]+/, '');

    let max = false;

    let value = new BigNumber(input).decimalPlaces(
      tokens[formData.deposit.token].decimals,
      BigNumber.ROUND_DOWN
    );

    if (value.isNaN() || value.isLessThanOrEqualTo(0)) {
      value = new BigNumber(0);
    }

    if (value.isGreaterThanOrEqualTo(balance.balance)) {
      value = balance.balance;
      max = true;
    }

    const formattedInput = (() => {
      if (value.isEqualTo(input)) return input;
      if (input === '') return '';
      if (input === '.') return `0.`;
      return (value as any).significant(6);
    })();

    setFormData({
      ...formData,
      deposit: {
        ...formData.deposit,
        input: formattedInput,
        amount: value,
        max: max,
      },
    });
  };

  // const handleInput = val => {
  //   const value =
  //     parseFloat(val) > balance.balance
  //       ? balance.balance
  //       : parseFloat(val) < 0
  //       ? 0
  //       : stripExtraDecimals(val);
  //   setFormData({
  //     ...formData,
  //     deposit: { amount: value, max: new BigNumber(value).minus(balance.balance).toNumber() === 0 },
  //   });
  // };

  const handleMax = () => {
    if (balance.balance > 0) {
      setFormData({
        ...formData,
        deposit: {
          ...formData.deposit,
          input: (balance.balance as any).significant(6),
          amount: balance.balance,
          max: true,
        },
      });
    }
  };

  const handleDeposit = () => {
    const steps = [];

    if (wallet.address) {
      if (item.network !== wallet.network) {
        dispatch(reduxActions.wallet.setNetwork(item.network));
        return false;
      }

      const amount = convertAmountToRawNumber(
        formData.deposit.amount,
        tokens[formData.deposit.token].decimals
      );

      if (balance.allowance.isLessThan(amount)) {
        steps.push({
          step: 'approve',
          message: t('Vault-ApproveMsg'),
          action: () =>
            dispatch(
              reduxActions.wallet.approval(
                item.network,
                tokens[formData.deposit.token].address,
                item.earnContractAddress
              )
            ),
          pending: false,
        });
      }

      // if (!balance.allowance) {
      //   steps.push({
      //     step: 'approve',
      //     message: t('Vault-ApproveMsg'),
      //     action: () =>
      //       dispatch(
      //         reduxActions.wallet.approval(
      //           item.network,
      //           item.tokenAddress,
      //           item.earnContractAddress
      //         )
      //       ),
      //     pending: false,
      //   });
      // }

      steps.push({
        step: 'stake',
        message: t('Vault-TxnConfirm', { type: t('Stake-noun') }),
        action: () =>
          dispatch(reduxActions.wallet.stake(item.network, item.earnContractAddress, amount)),
        pending: false,
        token: tokens[formData.deposit.token],
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
                  <Typography className={classes.value}>
                    {(balance.balance as any).significant(6)}
                  </Typography>
                </Box>
                <Box className={classes.staked}>
                  <Typography className={classes.label}>{t('Stake-Label-Staked')}</Typography>
                  <Typography className={classes.value}>
                    {(balance.deposited as any).significant(6)}
                  </Typography>
                </Box>
              </Box>
              <Box pt={2}>
                <FormControl className={classes.width} variant="filled">
                  <InputBase
                    placeholder="0.00"
                    className={classes.input}
                    value={formData.deposit.input}
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
