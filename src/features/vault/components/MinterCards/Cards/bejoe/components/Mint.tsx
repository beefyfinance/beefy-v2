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

const useStyles = makeStyles(styles as any);

export const Mint = memo(function Mint({ vaultId, minterId }: MinterCardParams) {
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
    if (joeBalance > BIG_ZERO) {
      setFormData({
        ...formData,
        deposit: {
          ...formData.deposit,
          input: isString(joeBalance) ? joeBalance : formatBigNumberSignificant(joeBalance),
          amount: new BigNumber(joeBalance),
          max: true,
        },
      });
    }
  };

  const handleInput = val => {
    const input = val.replace(/[,]+/, '').replace(/[^0-9.]+/, '');

    let max = false;
    let value = new BigNumber(input).decimalPlaces(tokenJoe.decimals, BigNumber.ROUND_DOWN);

    if (value.isNaN() || value.isLessThanOrEqualTo(0)) {
      value = BIG_ZERO;
    }

    if (value.isGreaterThanOrEqualTo(joeBalance)) {
      value = new BigNumber(joeBalance);
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

    if (joeAllowance.isLessThan(formData.deposit.amount)) {
      steps.push({
        step: 'approve',
        message: t('Vault-ApproveMsg'),
        action: walletActions.approval(tokenJoe, minter.contractAddress),
        pending: false,
      });
    }

    steps.push({
      step: 'mint',
      message: t('Vault-TxnConfirm', { type: t('Mint-noun') }),
      action: walletActions.mintDeposit(
        vault.chainId,
        minter.contractAddress,
        tokenJoe,
        tokenBeJoe,
        formData.deposit.amount,
        formData.deposit.max,
        minterId
      ),
      pending: false,
    });

    startStepper(steps);
  };

  return (
    <>
      <CardContent className={classes.cardContent}>
        <Typography className={classes.content} variant="body1">
          {t('bejoe-mint-Content')}
        </Typography>
        <Box className={classes.inputContainer}>
          <Box className={classes.balances}>
            <Typography className={classes.label}>
              {t('from')} <span className={classes.value}>{tokenJoe.symbol}</span>
            </Typography>
            <Typography className={classes.label}>
              {t('wallet')}{' '}
              <span className={classes.value}>
                {formatBigDecimals(joeBalance, 8)} {tokenJoe.symbol}
              </span>
            </Typography>
          </Box>
          <Paper component="form" className={classes.root}>
            <Box className={classes.inputLogo}>
              <AssetsImage assets={[]} img={'single-assets/JOE.png'} alt={'BinSpirit'} />
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
          <img alt="arrowDown" src={require('../../../../../../../images/arrowDown.svg').default} />
          <Box className={classes.line} />
        </Box>
        <Box className={classes.inputContainer}>
          <Box className={classes.balances}>
            <Typography className={classes.label}>
              {t('to')} <span className={classes.value}>{tokenBeJoe.symbol}</span>
            </Typography>
            <Typography className={classes.label}>
              {t('wallet')}
              <span className={classes.value}>
                {formatBigDecimals(beJoeBalance)} {tokenBeJoe.symbol}
              </span>
            </Typography>
          </Box>
          <Paper component="form" className={classes.root}>
            <Box className={classes.inputLogo}>
              <AssetsImage assets={[]} img={'partners/beJOE.svg'} alt={'beJOE'} />
            </Box>
            <InputBase disabled={true} placeholder="0.00" value={formData.deposit.input} />
          </Paper>
        </Box>
        <Button
          disabled={formData.deposit.amount.isLessThanOrEqualTo(0) || isStepping}
          onClick={handleDeposit}
          className={classes.btn}
        >
          {t('bejoe-action', { action: t('bejoe-mint') })}
        </Button>
      </CardContent>
      <Stepper />
    </>
  );
});
