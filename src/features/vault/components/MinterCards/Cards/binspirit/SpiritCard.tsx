import React, { memo } from 'react';
import { Box, Button, InputBase, makeStyles, Paper, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader } from '../../../Card';
import BinSpirit from '../../../../../../images/partners/binSpiritToken.svg';
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
import { selectErc20TokenById } from '../../../../../data/selectors/tokens';
import { isString } from 'lodash';
import { Step } from '../../../../../../components/Steps/types';
import { askForNetworkChange, askForWalletConnection } from '../../../../../data/actions/wallet';
import { walletActions } from '../../../../../data/actions/wallet-actions';
import { useStepper } from '../../../../../../components/Steps/hooks';
import { MinterCardParams } from '../../MinterCard';
import { selectMinterById } from '../../../../../data/selectors/minters';
import { selectAllowanceByTokenId } from '../../../../../data/selectors/allowances';

const useStyles = makeStyles(styles as any);

// TODO this and beFTM minter cards could be refactored out to a common component
export const SpiritCard = memo<MinterCardParams>(function SpiritCard({ vaultId, minterId }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));
  const minter = useSelector((state: BeefyState) => selectMinterById(state, minterId));
  const isWalletConnected = useSelector(selectIsWalletConnected);
  const isWalletOnVaultChain = useSelector(
    (state: BeefyState) => selectCurrentChainId(state) === vault.chainId
  );
  const tokenSPIRIT = useSelector((state: BeefyState) =>
    selectErc20TokenById(state, vault.chainId, minter.depositToken.symbol)
  );
  const tokenBinSPIRIT = useSelector((state: BeefyState) =>
    selectErc20TokenById(state, vault.chainId, minter.mintedToken.symbol)
  );
  const spiritBalance = useSelector((state: BeefyState) =>
    selectUserBalanceOfToken(state, vault.chainId, tokenSPIRIT.id)
  );
  const binSpiritBalance = useSelector((state: BeefyState) =>
    selectUserBalanceOfToken(state, vault.chainId, tokenBinSPIRIT.id)
  );
  const spiritAllowance = useSelector((state: BeefyState) =>
    selectAllowanceByTokenId(state, vault.chainId, tokenSPIRIT.id, minter.contractAddress)
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
    if (spiritBalance > BIG_ZERO) {
      setFormData({
        ...formData,
        deposit: {
          ...formData.deposit,
          input: isString(spiritBalance)
            ? spiritBalance
            : formatBigNumberSignificant(spiritBalance),
          amount: new BigNumber(spiritBalance),
          max: true,
        },
      });
    }
  };

  const handleInput = val => {
    const input = val.replace(/[,]+/, '').replace(/[^0-9.]+/, '');

    let max = false;
    let value = new BigNumber(input).decimalPlaces(tokenSPIRIT.decimals, BigNumber.ROUND_DOWN);

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

    if (spiritAllowance.isLessThan(formData.deposit.amount)) {
      steps.push({
        step: 'approve',
        message: t('Vault-ApproveMsg'),
        action: walletActions.approval(tokenSPIRIT, minter.contractAddress),
        pending: false,
      });
    }

    steps.push({
      step: 'mint',
      message: t('Vault-TxnConfirm', { type: t('Mint-noun') }),
      action: walletActions.mintDeposit(
        vault.chainId,
        minter.contractAddress,
        tokenSPIRIT,
        tokenBinSPIRIT,
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
          <img className={classes.logo} src={BinSpirit} alt="binSPIRIT" />
          <Typography className={classes.title} variant="h3">
            {t('Spirit-Title')}
          </Typography>
        </CardHeader>
        <CardContent className={classes.cardContent}>
          <Typography className={classes.content} variant="body1">
            {t('Spirit-Content')}
          </Typography>
          <Box className={classes.boxReminder}>
            <Typography className={classes.content} variant="body1">
              {t('Spirit-Reminder')}
            </Typography>
          </Box>
          <Box className={classes.inputContainer}>
            <Box className={classes.balances}>
              <Typography className={classes.label}>
                {t('Spirit-From')} <span className={classes.value}>{tokenSPIRIT.symbol}</span>
              </Typography>
              <Typography className={classes.label}>
                {t('Spirit-Wallet')}{' '}
                <span className={classes.value}>
                  {formatBigDecimals(spiritBalance, 8)} {tokenSPIRIT.symbol}
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
                {t('Spirit-To')} <span className={classes.value}>{tokenBinSPIRIT.symbol}</span>
              </Typography>
              <Typography className={classes.label}>
                {t('Spirit-Wallet')}{' '}
                <span className={classes.value}>
                  {formatBigDecimals(binSpiritBalance)} {tokenBinSPIRIT.symbol}
                </span>
              </Typography>
            </Box>
            <Paper component="form" className={classes.root}>
              <Box className={classes.inputLogo}>
                <AssetsImage assets={[]} img={'partners/binSpiritToken.svg'} alt={'BinSpirit'} />
              </Box>
              <InputBase
                disabled={true}
                placeholder="0.00"
                value={t('Spirit-Minimum', { input: formData.deposit.input || '0.00' })}
              />
            </Paper>
          </Box>
          <Button
            disabled={formData.deposit.amount.isLessThanOrEqualTo(0) || isStepping}
            onClick={handleDeposit}
            className={classes.btn}
          >
            {t('Spirit-Btn')}
          </Button>
        </CardContent>
      </Card>
      <Stepper />
    </>
  );
});
