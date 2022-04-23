import React, { memo } from 'react';
import { Box, Button, InputBase, makeStyles, Paper, Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { CardContent } from '../../../../Card';
import { AssetsImage } from '../../../../../../../components/AssetsImage';
import { styles } from '../styles';
import { useDispatch, useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import {
  BIG_ZERO,
  formatBigDecimals,
  formatBigNumberSignificant,
} from '../../../../../../../helpers/format';
import { selectVaultById } from '../../../../../../data/selectors/vaults';
import { BeefyState } from '../../../../../../../redux-types';
import { selectUserBalanceOfToken } from '../../../../../../data/selectors/balance';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
} from '../../../../../../data/selectors/wallet';
import { selectErc20TokenById } from '../../../../../../data/selectors/tokens';
import { isString } from 'lodash';
import { Step } from '../../../../../../../components/Steps/types';
import { askForNetworkChange, askForWalletConnection } from '../../../../../../data/actions/wallet';
import { walletActions } from '../../../../../../data/actions/wallet-actions';
import { useStepper } from '../../../../../../../components/Steps/hooks';
import { MinterCardParams } from '../../../MinterCard';
import { selectMinterById } from '../../../../../../data/selectors/minters';
import { selectAllowanceByTokenId } from '../../../../../../data/selectors/allowances';
import { useReserves } from '../useReserves';
import { selectChainById } from '../../../../../../data/selectors/chains';

const useStyles = makeStyles(styles as any);

export const Burn = memo(function Burn({ vaultId, minterId }: MinterCardParams) {
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));
  const minter = useSelector((state: BeefyState) => selectMinterById(state, minterId));
  const isWalletConnected = useSelector((state: BeefyState) => selectIsWalletConnected(state));
  const isWalletOnVaultChain = useSelector(
    (state: BeefyState) => selectCurrentChainId(state) === vault.chainId
  );
  const tokenJoe = useSelector((state: BeefyState) =>
    selectErc20TokenById(state, vault.chainId, minter.depositToken.symbol)
  );
  const tokenBeJoe = useSelector((state: BeefyState) =>
    selectErc20TokenById(state, vault.chainId, minter.mintedToken.symbol)
  );
  const joeBalance = useSelector((state: BeefyState) =>
    selectUserBalanceOfToken(state, vault.chainId, tokenJoe.id)
  );
  const beJoeBalance = useSelector((state: BeefyState) =>
    selectUserBalanceOfToken(state, vault.chainId, tokenBeJoe.id)
  );
  const joeAllowance = useSelector((state: BeefyState) =>
    selectAllowanceByTokenId(state, vault.chainId, tokenJoe.id, minter.contractAddress)
  );
  const chain = useSelector((state: BeefyState) => selectChainById(state, vault.chainId));

  const reserves = useReserves(minter.contractAddress, chain, beJoeBalance);

  const resetFormData = () => {
    setFormData({
      ...formData,
      withdraw: {
        ...formData.withdraw,
        input: '',
        amount: BIG_ZERO,
        max: false,
      },
    });
  };

  const [startStepper, isStepping, Stepper] = useStepper(vaultId, resetFormData);

  const [formData, setFormData] = React.useState({
    withdraw: {
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
    if (beJoeBalance > BIG_ZERO) {
      setFormData({
        ...formData,
        withdraw: {
          ...formData.withdraw,
          input: isString(beJoeBalance) ? beJoeBalance : formatBigNumberSignificant(beJoeBalance),
          amount: new BigNumber(beJoeBalance),
          max: true,
        },
      });
    }
  };

  const handleInput = val => {
    const input = val.replace(/[,]+/, '').replace(/[^0-9.]+/, '');

    let max = false;
    let value = new BigNumber(input).decimalPlaces(tokenBeJoe.decimals, BigNumber.ROUND_DOWN);

    if (value.isNaN() || value.isLessThanOrEqualTo(0)) {
      value = BIG_ZERO;
    }

    if (value.isGreaterThanOrEqualTo(beJoeBalance)) {
      value = new BigNumber(beJoeBalance);
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

  const handleWithdraw = () => {
    const steps: Step[] = [];
    if (!isWalletConnected) {
      return dispatch(askForWalletConnection());
    }
    if (!isWalletOnVaultChain) {
      return dispatch(askForNetworkChange({ chainId: vault.chainId }));
    }

    if (joeAllowance.isLessThan(formData.withdraw.amount)) {
      steps.push({
        step: 'approve',
        message: t('Vault-ApproveMsg'),
        action: walletActions.approval(tokenBeJoe, minter.contractAddress),
        pending: false,
      });
    }

    steps.push({
      step: 'burn',
      message: t('Vault-TxnConfirm', { type: t('Burn') }),
      action: walletActions.burnWithdraw(
        vault.chainId,
        minter.contractAddress,
        tokenJoe,
        tokenBeJoe,
        formData.withdraw.amount,
        formData.withdraw.max
      ),
      pending: false,
    });

    startStepper(steps);
  };

  return (
    <>
      <CardContent className={classes.cardContent}>
        <Typography className={classes.content} variant="body1">
          {t('bejoe-burn-Content')}
        </Typography>
        <Box className={classes.boxReminder}>
          <Typography className={classes.reservesText} variant="body1">
            {t('bejoe-reserves')}
          </Typography>
          <Box sx={{ display: 'flex' }}>
            <AssetsImage size={20} assetIds={[]} imageUri={'single-assets/JOE.png'} />
            <Typography className={classes.amountReserves}>
              {reserves.shiftedBy(-tokenJoe.decimals).toFixed(2)} {tokenJoe.symbol}
            </Typography>
          </Box>
        </Box>
        <Box className={classes.inputContainer}>
          <Box className={classes.balances}>
            <Typography className={classes.label}>
              {t('from')} <span className={classes.value}>{tokenBeJoe.symbol}</span>
            </Typography>
            <Typography className={classes.label}>
              {t('wallet')}{' '}
              <span className={classes.value}>
                {formatBigDecimals(beJoeBalance, 8)} {tokenBeJoe.symbol}
              </span>
            </Typography>
          </Box>
          <Paper component="form" className={classes.root}>
            <Box className={classes.inputLogo}>
              <AssetsImage size={20} assetIds={[]} imageUri={'partners/beJOE.svg'} />
            </Box>
            <InputBase
              placeholder="0.00"
              value={formData.withdraw.input}
              onChange={e => handleInput(e.target.value)}
              disabled={isStepping}
            />
            <Button onClick={handleMax}>{t('Transact-Max')}</Button>
          </Paper>
        </Box>
        <Box className={classes.customDivider}>
          <Box className={classes.line} />
          <img alt="arrowDown" src={require('../../../../../../../images/arrowDown.svg').default} />
          <Box className={classes.line} />
        </Box>
        <Box className={classes.inputContainer}>
          <Box className={classes.balances}>
            <Typography className={classes.label}>
              {t('to')} <span className={classes.value}>{tokenJoe.symbol}</span>
            </Typography>
            <Typography className={classes.label}>
              {t('wallet')}
              <span className={classes.value}>
                {formatBigDecimals(joeBalance)} {tokenJoe.symbol}
              </span>
            </Typography>
          </Box>
          <Paper component="form" className={classes.root}>
            <Box className={classes.inputLogo}>
              <AssetsImage size={20} assetIds={[]} imageUri={'single-assets/JOE.png'} />
            </Box>
            <InputBase disabled={true} placeholder="0.00" value={formData.withdraw.input} />
          </Paper>
        </Box>
        <Button
          disabled={
            formData.withdraw.amount.isGreaterThan(reserves.shiftedBy(-tokenBeJoe.decimals)) ||
            formData.withdraw.amount.isLessThanOrEqualTo(0) ||
            isStepping
          }
          onClick={handleWithdraw}
          className={classes.btn}
        >
          {t('bejoe-action', { action: t('bejoe-burn') })}
        </Button>
        {formData.withdraw.amount.isGreaterThan(reserves.shiftedBy(-tokenBeJoe.decimals)) && (
          <Box className={classes.noReserves}>
            <img
              className={classes.icon}
              src={require('../../../../../../../images/warning.svg').default}
              alt="warning"
            />
            <Typography variant="body1">{t('bejoe-noreserves')}</Typography>
          </Box>
        )}
      </CardContent>
      <Stepper />
    </>
  );
});
