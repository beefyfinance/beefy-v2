import React from 'react';
import { Typography, makeStyles, Button, Box, Paper, InputBase } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Card } from '../Card/Card';
import { CardHeader } from '../Card/CardHeader';
import { CardContent } from '../Card/CardContent';
import BinSpirit from '../../../../images/partners/binSpiritToken.svg';
import { AssetsImage } from '../../../../components/AssetsImage';
import { styles } from './styles';
import { useSelector, useDispatch } from 'react-redux';
import BigNumber from 'bignumber.js';
import { SpiritProps } from './SpiritProps';
import ArrowDownwardRoundedIcon from '@material-ui/icons/ArrowDownwardRounded';
import { useBalance } from './useBalance';
import { BIG_ZERO, convertAmountToRawNumber } from '../../../../helpers/format';
import { SpiritToken, binSpiritMintVault } from './SpiritToken';
import { reduxActions } from '../../../redux/actions';
import { isEmpty } from '../../../../helpers/utils';
import { Steps } from '../../../../components/Steps';
import { useAllowance } from './useAllowance';

const useStyles = makeStyles(styles as any);

const SpiritCard: React.FC<SpiritProps> = ({ item }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const network = item.network;

  const [spiritBalance, spiritBalanceString] = useBalance(
    SpiritToken.address,
    SpiritToken.decimals,
    network
  );

  const [spiritAllowance] = useAllowance(
    SpiritToken.address,
    SpiritToken.decimals,
    binSpiritMintVault.mintAdress,
    network
  );

  const [, binSpiritBalanceString] = useBalance(item.tokenAddress, item.tokenDecimals, network);

  const [steps, setSteps] = React.useState({
    modal: false,
    currentStep: -1,
    items: [],
    finished: false,
  });

  const { wallet, tokens } = useSelector((state: any) => ({
    wallet: state.walletReducer,
    tokens: state.balanceReducer.tokens[item.network],
  }));

  const [formData, setFormData] = React.useState({
    deposit: {
      input: '',
      amount: BIG_ZERO,
      max: false,
      token: null,
      isZap: false,
      zapEstimate: {
        isLoading: true,
      },
    },
    slippageTolerance: 0.01,
  });

  const handleMax = () => {
    if (spiritBalance > BIG_ZERO) {
      setFormData({
        ...formData,
        deposit: {
          ...formData.deposit,
          input: (spiritBalance as any).significant(6),
          amount: new BigNumber(spiritBalance),
          max: true,
        },
      });
    }
  };

  const handleInput = val => {
    const input = val.replace(/[,]+/, '').replace(/[^0-9.]+/, '');

    let max = false;
    let value = new BigNumber(input).decimalPlaces(SpiritToken.decimals, BigNumber.ROUND_DOWN);

    if (value.isNaN() || value.isLessThanOrEqualTo(0)) {
      value = BIG_ZERO;
    }

    if (value.isGreaterThanOrEqualTo(spiritBalance)) {
      value = new BigNumber(spiritBalance);
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

  const resetFormData = () => {
    setFormData({
      ...formData,
      deposit: {
        ...formData.deposit,
        input: '',
        amount: BIG_ZERO,
        max: false,
      },
    });
  };

  const handleDeposit = () => {
    const steps = [];
    if (wallet.address) {
      if (item.network !== wallet.network) {
        dispatch(reduxActions.wallet.setNetwork(item.network));
        return false;
      }

      const amount = convertAmountToRawNumber(formData.deposit.amount);

      if (spiritAllowance.isLessThan(amount)) {
        steps.push({
          step: 'approve',
          message: t('Vault-ApproveMsg'),
          action: () =>
            dispatch(
              reduxActions.wallet.approval(
                item.network,
                SpiritToken.address,
                binSpiritMintVault.mintAdress
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
              binSpiritMintVault.mintAdress,
              amount,
              formData.deposit.max
            )
          ),
        token: tokens[formData.deposit.token],
        pending: false,
      });

      setSteps({ modal: true, currentStep: 0, items: steps, finished: false });
    } //if (wallet.address)
  }; //const handleDeposit

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

  const handleClose = () => {
    resetFormData();
    setSteps({ modal: false, currentStep: -1, items: [], finished: false });
  };

  return (
    <>
      <Card>
        <CardHeader className={classes.header}>
          <img className={classes.logo} src={BinSpirit} alt="lacucina" />
          <Typography className={classes.title} variant="h3">
            {t('Spirit-Title')}
          </Typography>
        </CardHeader>
        <CardContent>
          <Typography className={classes.content} variant="body1">
            {t('Spirit-Content')}
          </Typography>
          <Box className={classes.inputContainer}>
            <Box className={classes.balances}>
              <Typography className={classes.label}>
                {t('Spirit-From')} <span className={classes.value}>{SpiritToken.symbol}</span>
              </Typography>
              <Typography className={classes.label}>
                {t('Spirit-Available')}{' '}
                <span className={classes.value}>
                  {spiritBalanceString} {SpiritToken.symbol}
                </span>
              </Typography>
            </Box>
            <Paper component="form" className={classes.root}>
              <Box className={classes.inputLogo}>
                <AssetsImage assets={[]} img={'partners/spiritToken.svg'} alt={'BinSpirit'} />
              </Box>
              <InputBase
                placeholder="0.00"
                value={formData.deposit.input}
                onChange={e => handleInput(e.target.value)}
              />
              <Button onClick={handleMax}>{t('Transact-Max')}</Button>
            </Paper>
          </Box>
          <Box className={classes.customDivider}>
            <Box className={classes.line} />
            <ArrowDownwardRoundedIcon htmlColor="#F5F5FF" />
            <Box className={classes.line} />
          </Box>
          <Box className={classes.inputContainer}>
            <Box className={classes.balances}>
              <Typography className={classes.label}>
                {t('Spirit-To')} <span className={classes.value}>{item.token}</span>
              </Typography>
              <Typography className={classes.label}>
                {t('Spirit-Available')}{' '}
                <span className={classes.value}>
                  {binSpiritBalanceString} {item.token}
                </span>
              </Typography>
            </Box>
            <Paper component="form" className={classes.root}>
              <Box className={classes.inputLogo}>
                <AssetsImage assets={[]} img={'partners/binSpiritToken.svg'} alt={'BinSpirit'} />
              </Box>
              <InputBase disabled={true} placeholder="0.00" value={formData.deposit.input} />
            </Paper>
          </Box>
          <Button
            disabled={formData.deposit.amount.isLessThanOrEqualTo(0)}
            onClick={handleDeposit}
            className={classes.btn}
          >
            {t('Spirit-Btn')}
          </Button>
        </CardContent>
      </Card>
      <Steps item={item} steps={steps} handleClose={handleClose} />
    </>
  );
};

export const Spirit = React.memo(SpiritCard);
