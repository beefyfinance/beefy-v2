import React, { memo } from 'react';
import { Button, InputBase, makeStyles, Paper } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { CardContent } from '../../../Card';
import { AssetsImage } from '../../../../../../components/AssetsImage';
import { styles } from '../styles';
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
import { selectErc20TokenByAddress } from '../../../../../data/selectors/tokens';
import { isString } from 'lodash';
import { Step } from '../../../../../../components/Steps/types';
import { askForNetworkChange, askForWalletConnection } from '../../../../../data/actions/wallet';
import { walletActions } from '../../../../../data/actions/wallet-actions';
import { useStepper } from '../../../../../../components/Steps/hooks';
import { MinterCardParams } from '../../MinterCard';
import { selectMinterById, selectMinterReserves } from '../../../../../data/selectors/minters';
import { selectAllowanceByTokenAddress } from '../../../../../data/selectors/allowances';
import { selectChainById } from '../../../../../data/selectors/chains';
import { AlertWarning } from '../../../../../../components/Alerts';

const useStyles = makeStyles(styles);

export const Burn = memo(function Burn({ vaultId, minterId }: MinterCardParams) {
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
    selectErc20TokenByAddress(state, vault.chainId, minter.depositToken.contractAddress)
  );
  const mintedToken = useSelector((state: BeefyState) =>
    selectErc20TokenByAddress(state, vault.chainId, minter.mintedToken.contractAddress)
  );
  const depositedTokenBalance = useSelector((state: BeefyState) =>
    selectUserBalanceOfToken(state, vault.chainId, depositToken.address)
  );
  const mintedTokenBalance = useSelector((state: BeefyState) =>
    selectUserBalanceOfToken(state, vault.chainId, mintedToken.address)
  );
  const depositedTokenAllowance = useSelector((state: BeefyState) =>
    selectAllowanceByTokenAddress(
      state,
      vault.chainId,
      depositToken.address,
      minter.contractAddress
    )
  );
  const reserves = useSelector((state: BeefyState) => selectMinterReserves(state, minter.id));

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
    let value = new BigNumber(input).decimalPlaces(mintedToken.decimals, BigNumber.ROUND_DOWN);

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
    const steps: Step[] = [];
    if (!isWalletConnected) {
      return dispatch(askForWalletConnection());
    }
    if (!isWalletOnVaultChain) {
      return dispatch(askForNetworkChange({ chainId: vault.chainId }));
    }

    if (depositedTokenAllowance.isLessThan(formData.withdraw.amount)) {
      steps.push({
        step: 'approve',
        message: t('Vault-ApproveMsg'),
        action: walletActions.approval(mintedToken, minter.contractAddress),
        pending: false,
      });
    }

    steps.push({
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
    });

    startStepper(steps);
  };

  return (
    <>
      <CardContent className={classes.cardContent}>
        <div className={classes.content}>
          {t('burn-Content', {
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
          <img alt="arrowDown" src={require('../../../../../../images/arrowDown.svg').default} />
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
                  formData.withdraw.amount.isGreaterThan(
                    reserves.shiftedBy(-mintedToken.decimals)
                  ) ||
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
      <Stepper />
    </>
  );
});
