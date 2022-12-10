import React, { memo } from 'react';
import { Button, InputBase, makeStyles, Paper } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { CardContent } from '../../../../Card';
import { AssetsImage } from '../../../../../../../components/AssetsImage';
import { styles } from '../styles';
import BigNumber from 'bignumber.js';
import { formatBigDecimals, formatBigNumberSignificant } from '../../../../../../../helpers/format';
import { selectVaultById } from '../../../../../../data/selectors/vaults';
import { selectUserBalanceOfToken } from '../../../../../../data/selectors/balance';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
} from '../../../../../../data/selectors/wallet';
import { selectErc20TokenByAddress } from '../../../../../../data/selectors/tokens';
import { isString } from 'lodash';
import { askForNetworkChange, askForWalletConnection } from '../../../../../../data/actions/wallet';
import { walletActions } from '../../../../../../data/actions/wallet-actions';
import { MinterCardParams } from '../../MinterCard';
import { selectMinterById, selectMinterReserves } from '../../../../../../data/selectors/minters';
import { selectAllowanceByTokenAddress } from '../../../../../../data/selectors/allowances';
import { selectChainById } from '../../../../../../data/selectors/chains';
import { AlertWarning } from '../../../../../../../components/Alerts';
import { useAppDispatch, useAppSelector } from '../../../../../../../store';
import { BIG_ZERO } from '../../../../../../../helpers/big-number';
import { stepperActions } from '../../../../../../data/reducers/wallet/stepper';
import { startStepper } from '../../../../../../data/actions/stepper';
import { selectIsStepperStepping } from '../../../../../../data/selectors/stepper';

const useStyles = makeStyles(styles);

export const Burn = memo(function Burn({ vaultId, minterId }: MinterCardParams) {
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const minter = useAppSelector(state => selectMinterById(state, minterId));
  const chain = useAppSelector(state => selectChainById(state, vault.chainId));
  const isWalletConnected = useAppSelector(state => selectIsWalletConnected(state));
  const isWalletOnVaultChain = useAppSelector(
    state => selectCurrentChainId(state) === vault.chainId
  );
  const depositToken = useAppSelector(state =>
    selectErc20TokenByAddress(state, vault.chainId, minter.depositToken.contractAddress)
  );
  const mintedToken = useAppSelector(state =>
    selectErc20TokenByAddress(state, vault.chainId, minter.mintedToken.contractAddress)
  );
  const depositedTokenBalance = useAppSelector(state =>
    selectUserBalanceOfToken(state, vault.chainId, depositToken.address)
  );
  const mintedTokenBalance = useAppSelector(state =>
    selectUserBalanceOfToken(state, vault.chainId, mintedToken.address)
  );
  const depositedTokenAllowance = useAppSelector(state =>
    selectAllowanceByTokenAddress(
      state,
      vault.chainId,
      depositToken.address,
      minter.contractAddress
    )
  );
  const reserves = useAppSelector(state => selectMinterReserves(state, minter.id));

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const isStepping = useAppSelector(selectIsStepperStepping);

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
    if (mintedTokenBalance > BIG_ZERO) {
      setFormData({
        ...formData,
        withdraw: {
          ...formData.withdraw,
          input: isString(mintedTokenBalance)
            ? mintedTokenBalance
            : formatBigNumberSignificant(mintedTokenBalance),
          amount: new BigNumber(mintedTokenBalance),
          max: true,
        },
      });
    }
  };

  const handleInput = val => {
    const input = val.replace(/[,]+/, '').replace(/[^0-9.]+/, '');

    let max = false;
    let value = new BigNumber(input).decimalPlaces(mintedToken.decimals, BigNumber.ROUND_FLOOR);

    if (value.isNaN() || value.isLessThanOrEqualTo(0)) {
      value = BIG_ZERO;
    }

    if (value.isGreaterThanOrEqualTo(mintedTokenBalance)) {
      value = new BigNumber(mintedTokenBalance);
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
    if (!isWalletConnected) {
      return dispatch(askForWalletConnection());
    }
    if (!isWalletOnVaultChain) {
      return dispatch(askForNetworkChange({ chainId: vault.chainId }));
    }

    if (depositedTokenAllowance.isLessThan(formData.withdraw.amount)) {
      dispatch(
        stepperActions.addStep({
          step: {
            step: 'approve',
            message: t('Vault-ApproveMsg'),
            action: walletActions.approval(mintedToken, minter.contractAddress),
            pending: false,
          },
        })
      );
    }
    dispatch(
      stepperActions.addStep({
        step: {
          step: 'burn',
          message: t('Vault-TxnConfirm', { type: t('Burn') }),
          action: walletActions.burnWithdraw(
            vault.chainId,
            minter.contractAddress,
            depositToken,
            mintedToken,
            formData.withdraw.amount,
            formData.withdraw.max,
            minterId
          ),
          pending: false,
        },
      })
    );

    dispatch(startStepper(chain.id));
  };

  return (
    <CardContent className={classes.cardContent}>
      <div className={classes.content}>
        {t('Burn-Content', {
          token1: minter.mintedToken.symbol,
          token2: minter.depositToken.symbol,
        })}
      </div>
      <div className={classes.boxReserves}>
        <div className={classes.reservesText}>
          {t('reserves', { token: minter.depositToken.symbol })}
        </div>
        <AssetsImage assetIds={[minter.depositToken.symbol]} size={24} chainId={chain.id} />
        <div className={classes.amountReserves}>
          {reserves.shiftedBy(-depositToken.decimals).toFixed(2)} {depositToken.symbol}
        </div>
      </div>
      <div className={classes.inputContainer}>
        <div className={classes.balances}>
          <div className={classes.label}>
            {t('from')} <span className={classes.value}>{mintedToken.symbol}</span>
          </div>
          <div className={classes.label}>
            {t('wallet')}{' '}
            <span className={classes.value}>
              {formatBigDecimals(mintedTokenBalance, 8)} {mintedToken.symbol}
            </span>
          </div>
        </div>
        <Paper component="form">
          <div className={classes.inputLogo}>
            <AssetsImage assetIds={[minter.mintedToken.symbol]} size={20} chainId={chain.id} />
          </div>
          <InputBase
            placeholder="0.00"
            value={formData.withdraw.input}
            onChange={e => handleInput(e.target.value)}
            disabled={isStepping}
          />
          <Button onClick={handleMax}>{t('Transact-Max')}</Button>
        </Paper>
      </div>
      <div className={classes.customDivider}>
        <div className={classes.line} />
        <img
          alt="arrowDown"
          src={require('../../../../../../../images/icons/arrowDown.svg').default}
        />
        <div className={classes.line} />
      </div>
      <div className={classes.inputContainer}>
        <div className={classes.balances}>
          <div className={classes.label}>
            {t('to')} <span className={classes.value}>{depositToken.symbol}</span>
          </div>
          <div className={classes.label}>
            {t('wallet')}
            <span className={classes.value}>
              {formatBigDecimals(depositedTokenBalance)} {depositToken.symbol}
            </span>
          </div>
        </div>
        <Paper component="form">
          <div className={classes.inputLogo}>
            <AssetsImage assetIds={[minter.depositToken.symbol]} size={20} chainId={chain.id} />
          </div>
          <InputBase disabled={true} placeholder="0.00" value={formData.withdraw.input} />
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
              disabled={
                formData.withdraw.amount.isGreaterThan(reserves.shiftedBy(-mintedToken.decimals)) ||
                formData.withdraw.amount.isLessThanOrEqualTo(0) ||
                isStepping
              }
              onClick={handleWithdraw}
              className={classes.btn}
            >
              {t('action', { action: t('burn'), token: minter.mintedToken.symbol })}
            </Button>
          )
        ) : (
          <Button onClick={() => dispatch(askForWalletConnection())} className={classes.btn}>
            {t('Network-ConnectWallet')}
          </Button>
        )}
      </>
      {formData.withdraw.amount.isGreaterThan(reserves.shiftedBy(-mintedToken.decimals)) && (
        <AlertWarning className={classes.noReserves}>
          {t('noreserves', { token: minter.depositToken.symbol })}
        </AlertWarning>
      )}
    </CardContent>
  );
});
