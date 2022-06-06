import React, { memo } from 'react';
import { Button, InputBase, makeStyles, Paper } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { CardContent } from '../../../Card';
import { AssetsImage } from '../../../../../../components/AssetsImage';
import { styles } from '../styles';
import { useDispatch, useSelector } from 'react-redux';
import BigNumber from 'bignumber.js';
import { formatBigDecimals, formatBigNumberSignificant } from '../../../../../../helpers/format';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { BeefyState } from '../../../../../../redux-types';
import { selectUserBalanceOfToken } from '../../../../../data/selectors/balance';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
} from '../../../../../data/selectors/wallet';
import {
  selectErc20TokenByAddress,
  selectTokenByAddress,
} from '../../../../../data/selectors/tokens';
import { isString } from 'lodash';
import { Step } from '../../../../../../components/Steps/types';
import { askForNetworkChange, askForWalletConnection } from '../../../../../data/actions/wallet';
import { walletActions } from '../../../../../data/actions/wallet-actions';
import { useStepper } from '../../../../../../components/Steps/hooks';
import { MinterCardParams } from '../../MinterCard';
import { selectMinterById } from '../../../../../data/selectors/minters';
import { selectAllowanceByTokenAddress } from '../../../../../data/selectors/allowances';
import { selectChainById } from '../../../../../data/selectors/chains';
import { BIG_ZERO } from '../../../../../../helpers/big-number';

const useStyles = makeStyles(styles);

export const Mint = memo(function Mint({ vaultId, minterId }: MinterCardParams) {
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const vault = useSelector((state: BeefyState) => selectVaultById(state, vaultId));
  const minter = useSelector((state: BeefyState) => selectMinterById(state, minterId));
  const chain = useSelector((state: BeefyState) => selectChainById(state, vault.chainId));
  const isWalletConnected = useSelector((state: BeefyState) => selectIsWalletConnected(state));
  const isWalletOnVaultChain = useSelector(
    (state: BeefyState) => selectCurrentChainId(state) === vault.chainId
  );
  const depositToken = useSelector((state: BeefyState) =>
    minter.depositToken.type === 'native'
      ? selectTokenByAddress(state, vault.chainId, minter.depositToken.contractAddress)
      : selectErc20TokenByAddress(state, vault.chainId, minter.depositToken.contractAddress)
  );
  const mintedToken = useSelector((state: BeefyState) =>
    selectErc20TokenByAddress(state, vault.chainId, minter.mintedToken.contractAddress)
  );
  const depositTokenBalance = useSelector((state: BeefyState) =>
    selectUserBalanceOfToken(state, vault.chainId, depositToken.address)
  );
  const mintedTokenBalance = useSelector((state: BeefyState) =>
    selectUserBalanceOfToken(state, vault.chainId, mintedToken.address)
  );
  const depositTokenAllowance = useSelector((state: BeefyState) =>
    selectAllowanceByTokenAddress(
      state,
      vault.chainId,
      depositToken.address,
      minter.contractAddress
    )
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
    if (depositTokenBalance > BIG_ZERO) {
      setFormData({
        ...formData,
        deposit: {
          ...formData.deposit,
          input: isString(depositTokenBalance)
            ? depositTokenBalance
            : formatBigNumberSignificant(depositTokenBalance),
          amount: new BigNumber(depositTokenBalance),
          max: true,
        },
      });
    }
  };

  const handleInput = val => {
    const input = val.replace(/[,]+/, '').replace(/[^0-9.]+/, '');

    let max = false;
    let value = new BigNumber(input).decimalPlaces(depositToken.decimals, BigNumber.ROUND_DOWN);

    if (value.isNaN() || value.isLessThanOrEqualTo(0)) {
      value = BIG_ZERO;
    }

    if (value.isGreaterThanOrEqualTo(depositTokenBalance)) {
      value = new BigNumber(depositTokenBalance);
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

    if (
      depositToken.type !== 'native' &&
      depositTokenAllowance.isLessThan(formData.deposit.amount)
    ) {
      steps.push({
        step: 'approve',
        message: t('Vault-ApproveMsg'),
        action: walletActions.approval(depositToken, minter.contractAddress),
        pending: false,
      });
    }

    steps.push({
      step: 'mint',
      message: t('Vault-TxnConfirm', { type: t('Mint-noun') }),
      action: walletActions.mintDeposit(
        vault.chainId,
        minter.contractAddress,
        depositToken,
        mintedToken,
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
        {minter.canBurnReserves ? (
          <div className={classes.content}>
            {t('Mint-Content', {
              token1: minter.mintedToken.symbol,
              token2: minter.depositToken.symbol,
            })}
          </div>
        ) : (
          <>
            {' '}
            <div className={classes.content}>
              {t('Mint-Content-Short', {
                token1: minter.mintedToken.symbol,
                token2: minter.depositToken.symbol,
              })}
            </div>
            <div className={classes.boxReminder}>
              <div className={classes.content}>
                {t('Mint-Reminder', {
                  token1: minter.mintedToken.symbol,
                  token2: minter.depositToken.symbol,
                })}
              </div>
            </div>
          </>
        )}
        <div className={classes.inputContainer}>
          <div className={classes.balances}>
            <div className={classes.label}>
              {t('from')} <span className={classes.value}>{depositToken.symbol}</span>
            </div>
            <div className={classes.label}>
              {t('wallet')}{' '}
              <span className={classes.value}>
                {formatBigDecimals(depositTokenBalance, 8)} {depositToken.symbol}
              </span>
            </div>
          </div>
          <Paper component="form">
            <div className={classes.inputLogo}>
              <AssetsImage assetIds={[minter.depositToken.symbol]} size={24} chainId={chain.id} />
            </div>
            <InputBase
              placeholder="0.00"
              value={formData.deposit.input}
              onChange={e => handleInput(e.target.value)}
              disabled={isStepping}
            />
            <Button onClick={handleMax}>{t('Transact-Max')}</Button>
          </Paper>
        </div>
        <div className={classes.customDivider}>
          <div className={classes.line} />
          <img alt="arrowDown" src={require('../../../../../../images/arrowDown.svg').default} />
          <div className={classes.line} />
        </div>
        <div className={classes.inputContainer}>
          <div className={classes.balances}>
            <div className={classes.label}>
              {t('to')} <span className={classes.value}>{mintedToken.symbol}</span>
            </div>
            <div className={classes.label}>
              {t('wallet')}
              <span className={classes.value}>
                {formatBigDecimals(mintedTokenBalance)} {mintedToken.symbol}
              </span>
            </div>
          </div>
          <Paper component="form">
            <div className={classes.inputLogo}>
              <AssetsImage assetIds={[minter.mintedToken.symbol]} size={20} chainId={chain.id} />
            </div>
            <InputBase disabled={true} placeholder="0.00" value={formData.deposit.input} />
          </Paper>
        </div>
        <>
          {isWalletConnected ? (
            !isWalletOnVaultChain ? (
              <Button
                onClick={() => dispatch(askForNetworkChange({ chainId: vault.chainId }))}
                className={classes.btn}
              >
                {t('Network-Change', { network: chain.name.toUpperCase() })}
              </Button>
            ) : (
              <Button
                disabled={formData.deposit.amount.isLessThanOrEqualTo(0) || isStepping}
                onClick={handleDeposit}
                className={classes.btn}
              >
                {t('action', { action: t('mint'), token: minter.mintedToken.symbol })}
              </Button>
            )
          ) : (
            <Button onClick={() => dispatch(askForWalletConnection())} className={classes.btn}>
              {t('Network-ConnectWallet')}
            </Button>
          )}
        </>
      </CardContent>
      <Stepper />
    </>
  );
});
