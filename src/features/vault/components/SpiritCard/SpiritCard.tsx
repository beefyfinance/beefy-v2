import React from 'react';
import { Typography, makeStyles, Button, Box, Paper, InputBase } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Card } from '../Card/Card';
import { CardHeader } from '../Card/CardHeader';
import { CardContent } from '../Card/CardContent';
import BinSpirit from '../../../../images/partners/binSpiritToken.svg';
import { AssetsImage } from '../../../../components/AssetsImage';
import { styles } from './styles';
import { useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import { SpiritProps } from './SpiritProps';
import ArrowDownwardRoundedIcon from '@material-ui/icons/ArrowDownwardRounded';

import { BIG_ZERO } from '../../../../helpers/format';

const useStyles = makeStyles(styles as any);

const SpiritCard: React.FC<SpiritProps> = ({ item }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [state, setState] = React.useState({
    balance: BIG_ZERO,
    allowance: BIG_ZERO,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [steps, setSteps] = React.useState({
    modal: false,
    currentStep: -1,
    items: [],
    finished: false,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { wallet, balance, tokens } = useSelector((state: any) => ({
    wallet: state.walletReducer,
    balance: state.balanceReducer,
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
    if (state.balance > BIG_ZERO) {
      setFormData({
        ...formData,
        deposit: {
          ...formData.deposit,
          input: (state.balance as any).significant(6),
          amount: state.balance,
          max: true,
        },
      });
    }
  };

  const handleInput = val => {
    const input = val.replace(/[,]+/, '').replace(/[^0-9.]+/, '');

    let max = false;
    let value = new BigNumber(input).decimalPlaces(
      tokens[formData.deposit.token].decimals,
      BigNumber.ROUND_DOWN
    );

    if (value.isNaN() || value.isLessThanOrEqualTo(0)) {
      value = BIG_ZERO;
    }

    if (value.isGreaterThanOrEqualTo(state.balance)) {
      value = state.balance;
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

  return (
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
              {t('Spirit-From')} <span className={classes.value}>SPIRIT</span>
            </Typography>
            <Typography className={classes.label}>
              {t('Spirit-Available')} <span className={classes.value}>0 SPIRIT</span>
            </Typography>
          </Box>
          <Paper component="form" className={classes.root}>
            <Box className={classes.inputLogo}>
              <AssetsImage assets={[]} img={'partners/spiritToken.svg'} alt={'BinSpirit'} />
            </Box>
            <InputBase placeholder="0.00" value={0} onChange={e => handleInput(e.target.value)} />
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
              {t('Spirit-To')} <span className={classes.value}>binSPIRIT</span>
            </Typography>
            <Typography className={classes.label}>
              {t('Spirit-Available')} <span className={classes.value}>0 binSPIRIT</span>
            </Typography>
          </Box>
          <Paper component="form" className={classes.root}>
            <Box className={classes.inputLogo}>
              <AssetsImage assets={[]} img={'partners/binSpiritToken.svg'} alt={'BinSpirit'} />
            </Box>
            <InputBase placeholder="0.00" value={0} onChange={e => handleInput(e.target.value)} />
          </Paper>
        </Box>
        <Button className={classes.btn}>{t('Spirit-Btn')}</Button>
      </CardContent>
    </Card>
  );
};

export const Spirit = React.memo(SpiritCard);
