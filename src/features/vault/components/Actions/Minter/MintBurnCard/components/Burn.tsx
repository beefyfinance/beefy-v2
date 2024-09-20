import { memo, useCallback, useEffect, useMemo } from 'react';
import { Button, InputBase, makeStyles, Paper } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { CardContent } from '../../../../Card';
import { AssetsImage } from '../../../../../../../components/AssetsImage';
import { styles } from '../styles';
import BigNumber from 'bignumber.js';
import { formatTokenDisplayCondensed } from '../../../../../../../helpers/format';
import { selectVaultById } from '../../../../../../data/selectors/vaults';
import { selectUserBalanceOfToken } from '../../../../../../data/selectors/balance';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
} from '../../../../../../data/selectors/wallet';
import {
  selectErc20TokenByAddress,
  selectTokenByAddress,
} from '../../../../../../data/selectors/tokens';
import { askForNetworkChange, askForWalletConnection } from '../../../../../../data/actions/wallet';
import { walletActions } from '../../../../../../data/actions/wallet-actions';
import type { MinterCardParams } from '../../MinterCard';
import {
  selectMinterById,
  selectMinterReserves,
  selectMinterTotalSupply,
} from '../../../../../../data/selectors/minters';
import { selectAllowanceByTokenAddress } from '../../../../../../data/selectors/allowances';
import { selectChainById } from '../../../../../../data/selectors/chains';
import { AlertWarning } from '../../../../../../../components/Alerts';
import { useAppDispatch, useAppSelector } from '../../../../../../../store';
import { fromWei, toWei } from '../../../../../../../helpers/big-number';
import { stepperActions } from '../../../../../../data/reducers/wallet/stepper';
import { startStepper } from '../../../../../../data/actions/stepper';
import { selectIsStepperStepping } from '../../../../../../data/selectors/stepper';
import iconArrowDown from '../../../../../../../images/icons/arrowDown.svg';
import { isTokenErc20 } from '../../../../../../data/entities/token';
import { minterActions } from '../../../../../../data/reducers/wallet/minters';
import { selectMinterFormData } from '../../../../../../data/selectors/minter';

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
    selectTokenByAddress(state, vault.chainId, minter.depositToken.contractAddress)
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
  const mintedTokenAllowance = useAppSelector(state =>
    selectAllowanceByTokenAddress(state, vault.chainId, mintedToken.address, minter.burnerAddress!)
  );
  const reserves = useAppSelector(state => selectMinterReserves(state, minter.id));
  const totalSupply = useAppSelector(state => selectMinterTotalSupply(state, minter.id));
  const isStepping = useAppSelector(selectIsStepperStepping);

  const formData = useAppSelector(selectMinterFormData);

  const outputAmount = useMemo(() => {
    if (minter.canBurn === 'supply') {
      const inputWei = toWei(formData.amount, mintedToken.decimals);
      const outputWei = inputWei
        .times(reserves)
        .div(totalSupply)
        .decimalPlaces(depositToken.decimals, BigNumber.ROUND_FLOOR);
      return fromWei(outputWei, depositToken.decimals);
    }

    return formData.amount;
  }, [minter.canBurn, formData.amount, reserves, totalSupply, depositToken, mintedToken]);

  const handleMax = useCallback(() => {
    dispatch(
      minterActions.setMax({ balance: mintedTokenBalance, decimals: depositToken.decimals })
    );
  }, [depositToken.decimals, dispatch, mintedTokenBalance]);

  const handleInput = useCallback(
    (val: string) => {
      dispatch(
        minterActions.setInput({
          val,
          balance: mintedTokenBalance,
          decimals: depositToken.decimals,
        })
      );
    },
    [depositToken.decimals, dispatch, mintedTokenBalance]
  );

  const handleWithdraw = () => {
    if (!isWalletConnected) {
      return dispatch(askForWalletConnection());
    }
    if (!isWalletOnVaultChain) {
      return dispatch(askForNetworkChange({ chainId: vault.chainId }));
    }

    // minted token does not need allowance to burn itself
    if (
      minter.burnerAddress !== mintedToken.address &&
      isTokenErc20(mintedToken) &&
      mintedTokenAllowance.isLessThan(formData.amount)
    ) {
      dispatch(
        stepperActions.addStep({
          step: {
            step: 'approve',
            message: t('Vault-ApproveMsg'),
            action: walletActions.approval(mintedToken, minter.burnerAddress!, formData.amount),
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
            minter.burnerAddress!,
            depositToken,
            mintedToken,
            formData.amount,
            formData.max,
            minterId
          ),
          pending: false,
        },
      })
    );

    dispatch(startStepper(chain.id));
  };

  useEffect(() => {
    dispatch(minterActions.resetForm());
  }, [dispatch]);

  return (
    <CardContent className={classes.cardContent}>
      <div className={classes.content}>
        {t(
          [
            `Burn-${minter.canBurn}-${minter.id}-Content`,
            `Burn-${minter.canBurn}-Content`,
            'Burn-Content',
          ],
          {
            mintedToken: minter.mintedToken.symbol,
            depositToken: minter.depositToken.symbol,
          }
        )}
      </div>
      {minter.canBurn === 'reserves' ? (
        <div className={classes.boxReserves}>
          <div className={classes.reservesText}>
            {t('reserves', { token: minter.depositToken.symbol })}
          </div>
          <AssetsImage assetSymbols={[minter.depositToken.symbol]} size={24} chainId={chain.id} />
          <div className={classes.amountReserves}>
            {reserves.shiftedBy(-depositToken.decimals).toFixed(2)} {depositToken.symbol}
          </div>
        </div>
      ) : null}
      <div className={classes.inputContainer}>
        <div className={classes.balances}>
          <div className={classes.label}>
            {t('from')} <span className={classes.value}>{mintedToken.symbol}</span>
          </div>
          <div className={classes.label}>
            {t('wallet')}{' '}
            <span className={classes.value}>
              {formatTokenDisplayCondensed(mintedTokenBalance, mintedToken.decimals)}{' '}
              {mintedToken.symbol}
            </span>
          </div>
        </div>
        <Paper component="form">
          <div className={classes.inputLogo}>
            <AssetsImage assetSymbols={[minter.mintedToken.symbol]} size={20} chainId={chain.id} />
          </div>
          <InputBase
            placeholder="0.00"
            value={formData.input}
            onChange={e => handleInput(e.target.value)}
            disabled={isStepping}
          />
          <Button onClick={handleMax}>{t('Transact-Max')}</Button>
        </Paper>
      </div>
      <div className={classes.customDivider}>
        <div className={classes.line} />
        <img alt="arrowDown" src={iconArrowDown} />
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
              {formatTokenDisplayCondensed(depositedTokenBalance, depositToken.decimals)}{' '}
              {depositToken.symbol}
            </span>
          </div>
        </div>
        <Paper component="form">
          <div className={classes.inputLogo}>
            <AssetsImage assetSymbols={[minter.depositToken.symbol]} size={20} chainId={chain.id} />
          </div>
          <InputBase disabled={true} placeholder="0.00" value={outputAmount} />
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
                formData.amount.isGreaterThan(reserves.shiftedBy(-mintedToken.decimals)) ||
                formData.amount.isLessThanOrEqualTo(0) ||
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
      {formData.amount.isGreaterThan(reserves.shiftedBy(-mintedToken.decimals)) && (
        <AlertWarning className={classes.noReserves}>
          {t('noreserves', { token: minter.depositToken.symbol })}
        </AlertWarning>
      )}
    </CardContent>
  );
});
