import React from 'react';
import { Typography, makeStyles, Button, Box, Paper, InputBase } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Card } from '../Card/Card';
import { CardHeader } from '../Card/CardHeader';
import { CardContent } from '../Card/CardContent';
import BeFtmLogo from '../../../../images/partners/beftm.svg';
import { AssetsImage } from '../../../../components/AssetsImage';
import { styles } from './styles';
import { useSelector, useDispatch } from 'react-redux';
import BigNumber from 'bignumber.js';
import ArrowDownwardRoundedIcon from '@material-ui/icons/ArrowDownwardRounded';
import {
  BIG_ZERO,
  formatBigDecimals,
  formatBigNumberSignificant,
} from '../../../../helpers/format';
import { beFtmMintVault } from './BeFtmToken';
import { VaultEntity } from '../../../data/entities/vault';
import { selectVaultById } from '../../../data/selectors/vaults';
import { BeefyState } from '../../../../redux-types';
import { selectUserBalanceOfToken } from '../../../data/selectors/balance';
import { selectCurrentChainId, selectIsWalletConnected } from '../../../data/selectors/wallet';
import { selectTokenById } from '../../../data/selectors/tokens';
import { isString } from 'lodash';
import { Step } from '../../../../components/Steps/types';
import { askForNetworkChange, askForWalletConnection } from '../../../data/actions/wallet';
import { useStepper } from '../../../../components/Steps/hooks';
import { beFtmDeposit } from './beftm-wallet-action';

const useStyles = makeStyles(styles as any);

const _BeFtmCard = ({ vaultId }: { vaultId: VaultEntity['id'] }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));

  const oracleToken = useSelector((state: BeefyState) =>
    selectTokenById(state, vault.chainId, vault.oracleId)
  );

  const BeFTMBalance = useSelector((state: BeefyState) =>
    selectUserBalanceOfToken(state, vault.chainId, vault.oracleId)
  );

  const FTMBalance = useSelector((state: BeefyState) =>
    selectUserBalanceOfToken(state, vault.chainId, 'FTM')
  );

  const isWalletConnected = useSelector((state: BeefyState) => selectIsWalletConnected(state));
  const isWalletOnVaultChain = useSelector(
    (state: BeefyState) => selectCurrentChainId(state) === vault.chainId
  );

  const resetFormData = () => {
    setFormData({
      ...formData,
      deposit: {
        ...formData.deposit,
        input: '0.00',
        amount: BIG_ZERO,
        max: false,
      },
    });
  };

  const [startStepper, isStepping, Stepper] = useStepper(vaultId, resetFormData);

  const [formData, setFormData] = React.useState({
    deposit: {
      input: '0.00',
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
    if (FTMBalance.isGreaterThan(BIG_ZERO)) {
      setFormData({
        ...formData,
        deposit: {
          ...formData.deposit,
          input: isString(FTMBalance) ? FTMBalance : formatBigNumberSignificant(FTMBalance),
          amount: FTMBalance,
          max: true,
        },
      });
    }
  };

  const handleInput = val => {
    const input = val.replace(/[,]+/, '').replace(/[^0-9.]+/, '');

    let max = false;
    let value = new BigNumber(input).decimalPlaces(18, BigNumber.ROUND_DOWN);

    if (value.isNaN() || value.isLessThanOrEqualTo(0)) {
      value = BIG_ZERO;
    }

    if (value.isGreaterThanOrEqualTo(FTMBalance)) {
      value = FTMBalance;
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
      deposit: {
        ...formData.deposit,
        input: formattedInput,
        amount: value,
        max: max,
      },
    });
  };

  const handleDeposit = () => {
    const steps: Step[] = [];
    if (!isWalletConnected) {
      return dispatch(askForWalletConnection());
    }
    if (!isWalletOnVaultChain) {
      return dispatch(askForNetworkChange({ chainId: vault.chainId }));
    }

    steps.push({
      step: 'mint',
      message: t('Vault-TxnConfirm', { type: t('Mint-noun') }),
      action: beFtmDeposit(
        beFtmMintVault.mintAdress,
        formData.deposit.amount,
        formData.deposit.max
      ),
      pending: false,
    });

    startStepper(steps);
  };

  return (
    <>
      <Card>
        <CardHeader className={classes.header}>
          <img className={classes.logo} src={BeFtmLogo} alt="lacucina" />
          <Typography className={classes.title} variant="h3">
            {t('beFtm-Title')}
          </Typography>
        </CardHeader>
        <CardContent className={classes.cardContent}>
          <Typography className={classes.content} variant="body1">
            {t('beFtm-Content')}
          </Typography>
          <Box className={classes.boxReminder}>
            <Typography className={classes.content} variant="body1">
              {t('beFtm-Reminder')}
            </Typography>
          </Box>
          <Box className={classes.inputContainer}>
            <Box className={classes.balances}>
              <Typography className={classes.label}>
                {t('beFtm-From')} <span className={classes.value}>{'FTM'}</span>
              </Typography>
              <Typography className={classes.label}>
                {t('beFtm-Wallet')}{' '}
                <span className={classes.value}>
                  {formatBigDecimals(FTMBalance)} {'FTM'}
                </span>
              </Typography>
            </Box>
            <Paper component="form" className={classes.root}>
              <Box className={classes.inputLogo}>
                <AssetsImage assets={[]} img={'single-assets/FTM.png'} alt={'FTM'} />
              </Box>
              <InputBase
                placeholder="0.00"
                value={formData.deposit.input}
                onChange={e => handleInput(e.target.value)}
                disabled={isStepping}
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
                {t('beFtm-To')} <span className={classes.value}>{oracleToken.symbol}</span>
              </Typography>
              <Typography className={classes.label}>
                {t('beFtm-Wallet')}{' '}
                <span className={classes.value}>
                  {formatBigDecimals(BeFTMBalance)} {oracleToken.symbol}
                </span>
              </Typography>
            </Box>
            <Paper component="form" className={classes.root}>
              <Box className={classes.inputLogo}>
                <AssetsImage assets={[]} img={'partners/beftm.svg'} alt={'beFTM'} />
              </Box>
              <InputBase
                disabled={true}
                placeholder="0.00"
                value={t('beFTM-Minimum', { input: formData.deposit.input ?? '0.00' })}
              />
            </Paper>
          </Box>
          <Button
            disabled={formData.deposit.amount.isLessThanOrEqualTo(0) || isStepping}
            onClick={handleDeposit}
            className={classes.btn}
          >
            {t('beFtm-Btn')}
          </Button>
        </CardContent>
      </Card>
      <Stepper />
    </>
  );
};

export const BeFtm = React.memo(_BeFtmCard);
