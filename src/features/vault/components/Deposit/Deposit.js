import {
  Box,
  Button,
  InputBase,
  makeStyles,
  Paper,
  Typography,
  FormControlLabel,
  RadioGroup,
  Radio,
} from '@material-ui/core';
import OpenInNewRoundedIcon from '@material-ui/icons/OpenInNewRounded';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import styles from '../styles';
import BigNumber from 'bignumber.js';
import Loader from 'components/loader';
import { byDecimals, convertAmountToRawNumber, stripExtraDecimals } from 'helpers/format';
import { isEmpty } from 'helpers/utils';
import reduxActions from 'features/redux/actions';
import Steps from 'components/Steps';
import AssetsImage from 'components/AssetsImage';
import BoostWidget from '../BoostWidget';
import FeeBreakdown from '../FeeBreakdown';
import switchNetwork from 'helpers/switchNetwork';

BigNumber.prototype.significant = function (digits) {
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
  const { wallet, balance, tokens } = useSelector(state => ({
    wallet: state.walletReducer,
    balance: state.balanceReducer,
    tokens: state.balanceReducer.tokens[item.network],
  }));
  const t = useTranslation().t;

  const [state, setState] = React.useState({
    balance: new BigNumber(0),
    allowance: new BigNumber(0),
  });
  const [steps, setSteps] = React.useState({
    modal: false,
    currentStep: -1,
    items: [],
    finished: false,
  });
  const [isLoading, setIsLoading] = React.useState(true);

  const handleInput = val => {
    const input = val.replace(/[,]+/, '').replace(/[^0-9\.]+/, '');

    let max = false;
    let value = new BigNumber(input).decimalPlaces(
      tokens[formData.deposit.token].decimals,
      BigNumber.ROUND_DOWN
    );

    if (value.isNaN() || value.isLessThanOrEqualTo(0)) {
      value = new BigNumber(0);
    }

    if (value.isGreaterThanOrEqualTo(state.balance)) {
      value = state.balance;
      max = true;
    }

    const formattedInput = (() => {
      if (value.isEqualTo(input)) return input;
      if (input === '') return '';
      if (input === '.') return `0.`;
      return value.significant(6);
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

  const handleAsset = tokenSymbol => {
    setFormData({
      ...formData,
      deposit: {
        ...formData.deposit,
        input: '',
        amount: new BigNumber(0),
        max: false,
        token: tokenSymbol,
      },
    });
  };

  const handleMax = () => {
    if (state.balance > 0) {
      setFormData({
        ...formData,
        deposit: {
          ...formData.deposit,
          input: state.balance.significant(6),
          amount: state.balance,
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

      const amount = convertAmountToRawNumber(formData.deposit.amount, item.tokenDecimals);

      if (state.allowance.isLessThan(amount)) {
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
              amount,
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
    if (wallet.address && !isEmpty(tokens[formData.deposit.token])) {
      amount = byDecimals(
        new BigNumber(tokens[formData.deposit.token].balance),
        tokens[formData.deposit.token].decimals
      );
      if (formData.zap && formData.deposit.token !== item.token) {
        approved = tokens[formData.deposit.token].allowance[formData.zap.address];
      } else {
        approved = tokens[formData.deposit.token].allowance[item.earnContractAddress];
      }
    }
    setState({
      balance: new BigNumber(amount),
      allowance: new BigNumber(approved),
    });
  }, [wallet.address, item, balance, formData.deposit.token]);

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
        <RadioGroup
          value={formData.deposit.token}
          aria-label="deposit-asset"
          name="deposit-asset"
          onChange={e => handleAsset(e.target.value)}
        >
          <FormControlLabel
            value={item.token}
            control={<Radio />}
            label={
              /*TODO: wrap label content into component */
              <Box className={classes.balanceContainer} display="flex" alignItems="center">
                <Box lineHeight={0}>
                  <AssetsImage img={item.logo} assets={item.assets} alt={item.name} />
                </Box>
                <Box flexGrow={1} pl={1} lineHeight={0}>
                  {isLoading ? (
                    <Loader line={true} />
                  ) : (
                    <Typography variant={'body1'}>
                      {byDecimals(
                        tokens[item.token].balance,
                        tokens[item.token].decimals
                      ).significant(6)}{' '}
                      {item.token}
                    </Typography>
                  )}
                </Box>
                <Box>
                  <a
                    href={item.buyTokenUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={classes.btnSecondary}
                  >
                    <Button endIcon={<OpenInNewRoundedIcon />}>{t('Transact-BuyTkn')}</Button>
                  </a>
                </Box>
              </Box>
            }
          />
          {formData.zap?.tokens[0] && (
            <FormControlLabel
              value={formData.zap.tokens[0].symbol}
              control={<Radio />}
              label={
                <Box className={classes.balanceContainer} display="flex" alignItems="center">
                  <Box lineHeight={0}>
                    <AssetsImage
                      assets={[formData.zap.tokens[0].symbol]}
                      alt={formData.zap.tokens[0].name}
                    />
                  </Box>
                  <Box flexGrow={1} pl={1} lineHeight={0}>
                    {isLoading ? (
                      <Loader line={true} />
                    ) : (
                      <Typography variant={'body1'}>
                        {byDecimals(
                          tokens[formData.zap.tokens[0].symbol].balance,
                          formData.zap.tokens[0].decimals
                        ).significant(6)}{' '}
                        {formData.zap.tokens[0].symbol}
                      </Typography>
                    )}
                  </Box>
                </Box>
              }
            />
          )}
          {formData.zap?.tokens[1] && (
            <FormControlLabel
              value={formData.zap.tokens[1].symbol}
              control={<Radio />}
              label={
                <Box className={classes.balanceContainer} display="flex" alignItems="center">
                  <Box lineHeight={0}>
                    <AssetsImage
                      assets={[formData.zap.tokens[1].symbol]}
                      alt={formData.zap.tokens[1].name}
                    />
                  </Box>
                  <Box flexGrow={1} pl={1} lineHeight={0}>
                    {isLoading ? (
                      <Loader line={true} />
                    ) : (
                      <Typography variant={'body1'}>
                        {byDecimals(
                          tokens[formData.zap.tokens[1].symbol].balance,
                          formData.zap.tokens[1].decimals
                        ).significant(6)}{' '}
                        {formData.zap.tokens[1].symbol}
                      </Typography>
                    )}
                  </Box>
                </Box>
              }
            />
          )}
        </RadioGroup>
        <Box className={classes.inputContainer}>
          <Paper component="form" className={classes.root}>
            <Box className={classes.inputLogo}>
              <AssetsImage
                img={formData.deposit.token === item.token ? item.logo : null}
                assets={
                  formData.deposit.token === item.token ? item.assets : [formData.deposit.token]
                }
                alt={formData.token}
              />
            </Box>
            <InputBase
              placeholder="0.00"
              value={formData.deposit.input}
              onChange={e => handleInput(e.target.value)}
            />
            <Button onClick={handleMax}>{t('Transact-Max')}</Button>
          </Paper>
        </Box>
        <FeeBreakdown withdrawalFee={item.withdrawalFee} depositFee={item.depositFee} />
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
                disabled={formData.deposit.amount.isLessThanOrEqualTo(0)}
              >
                {formData.deposit.max ? t('Deposit-All') : t('Deposit-Verb')}
              </Button>
            )
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
