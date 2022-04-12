import React, { memo } from 'react';
import { Box, Button, InputBase, makeStyles, Paper, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader } from '../../../Card';
import BeFtmLogo from '../../../../../../images/partners/beftm.svg';
import { AssetsImage } from '../../../../../../components/AssetsImage';
import { styles } from './styles';
import { useDispatch, useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import {
  BIG_ZERO,
  formatBigDecimals,
  formatBigNumberSignificant,
} from '../../../../../../helpers/format';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { BeefyState } from '../../../../../../redux-types';
import { selectUserBalanceOfToken } from '../../../../../data/selectors/balance';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
} from '../../../../../data/selectors/wallet';
import { selectTokenById } from '../../../../../data/selectors/tokens';
import { isString } from 'lodash';
import { Step } from '../../../../../../components/Steps/types';
import { askForNetworkChange, askForWalletConnection } from '../../../../../data/actions/wallet';
import { useStepper } from '../../../../../../components/Steps/hooks';
import { walletActions } from '../../../../../data/actions/wallet-actions';
import { MinterCardParams } from '../../MinterCard';
import { selectMinterById } from '../../../../../data/selectors/minters';

const useStyles = makeStyles(styles as any);

// TODO this and SpiritCard minter cards could be refactored out to a common component
export const BeFtmCard = memo<MinterCardParams>(function BeFtmCard({ vaultId, minterId }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));
  const minter = useSelector((state: BeefyState) => selectMinterById(state, minterId));
  const isWalletConnected = useSelector(selectIsWalletConnected);
  const isWalletOnVaultChain = useSelector(
    (state: BeefyState) => selectCurrentChainId(state) === vault.chainId
  );
  const ftmToken = useSelector((state: BeefyState) =>
    selectTokenById(state, vault.chainId, minter.depositToken.symbol)
  );
  const beFtmToken = useSelector((state: BeefyState) =>
    selectTokenById(state, vault.chainId, minter.mintedToken.symbol)
  );
  const ftmBalance = useSelector((state: BeefyState) =>
    selectUserBalanceOfToken(state, vault.chainId, ftmToken.id)
  );
  const beFtmBalance = useSelector((state: BeefyState) =>
    selectUserBalanceOfToken(state, vault.chainId, beFtmToken.id)
  );

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

  const [startStepper, isStepping, Stepper] = useStepper(vaultId, resetFormData);

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
    if (ftmBalance.isGreaterThan(BIG_ZERO)) {
      setFormData({
        ...formData,
        deposit: {
          ...formData.deposit,
          input: isString(ftmBalance) ? ftmBalance : formatBigNumberSignificant(ftmBalance),
          amount: ftmBalance,
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

    if (value.isGreaterThanOrEqualTo(ftmBalance)) {
      value = ftmBalance;
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
      action: walletActions.mintDeposit(
        minter.chainId,
        minter.contractAddress,
        ftmToken,
        beFtmToken,
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
          <img className={classes.logo} src={BeFtmLogo} alt="beFTM" />
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
                  {formatBigDecimals(ftmBalance)} {'FTM'}
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
            <img alt="arrowDown" src={require('../../../../../../images/arrowDown.svg').default} />
            <Box className={classes.line} />
          </Box>
          <Box className={classes.inputContainer}>
            <Box className={classes.balances}>
              <Typography className={classes.label}>
                {t('beFtm-To')} <span className={classes.value}>{beFtmToken.symbol}</span>
              </Typography>
              <Typography className={classes.label}>
                {t('beFtm-Wallet')}{' '}
                <span className={classes.value}>
                  {formatBigDecimals(beFtmBalance)} {beFtmToken.symbol}
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
                value={t('beFTM-Minimum', { input: formData.deposit.input || '0.00' })}
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
});
