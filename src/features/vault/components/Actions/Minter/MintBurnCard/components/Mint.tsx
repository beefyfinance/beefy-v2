import { memo, useCallback, useEffect, useMemo } from 'react';
import { Button, InputBase, makeStyles, Paper } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { CardContent } from '../../../../Card';
import { AssetsImage } from '../../../../../../../components/AssetsImage';
import { styles } from '../styles';
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
import { selectMinterById, selectMinterVaultsType } from '../../../../../../data/selectors/minters';
import { selectAllowanceByTokenAddress } from '../../../../../../data/selectors/allowances';
import { selectChainById } from '../../../../../../data/selectors/chains';
import { useAppDispatch, useAppSelector } from '../../../../../../../store';
import { stepperActions } from '../../../../../../data/reducers/wallet/stepper';
import { selectIsStepperStepping } from '../../../../../../data/selectors/stepper';
import { startStepper } from '../../../../../../data/actions/stepper';
import iconArrowDown from '../../../../../../../images/icons/arrowDown.svg';
import { minterActions } from '../../../../../../data/reducers/wallet/minters';
import { selectMinterFormData } from '../../../../../../data/selectors/minter';

const useStyles = makeStyles(styles);

export const Mint = memo(function Mint({ vaultId, minterId }: MinterCardParams) {
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
  const depositTokenBalance = useAppSelector(state =>
    selectUserBalanceOfToken(state, vault.chainId, depositToken.address)
  );
  const mintedTokenBalance = useAppSelector(state =>
    selectUserBalanceOfToken(state, vault.chainId, mintedToken.address)
  );
  const depositTokenAllowance = useAppSelector(state =>
    selectAllowanceByTokenAddress(state, vault.chainId, depositToken.address, minter.minterAddress)
  );

  const minterEarningsType = useAppSelector(state => selectMinterVaultsType(state, minterId));

  const formData = useAppSelector(selectMinterFormData);

  const { canBurn, canZapInWithOneInch } = minter;
  const [contentKey, reminderKey] = useMemo(() => {
    const liquidityType = canBurn ? 'Burnable' : 'Liquid';
    const zapType = canZapInWithOneInch ? 'WithZap' : 'WithoutZap';

    return ['Content', 'Reminder'].map(key => [
      `Mint-${key}-${liquidityType}-${minterEarningsType}-${zapType}`,
      `Mint-${key}-${liquidityType}-${minterEarningsType}`,
      `Mint-${key}-${liquidityType}`,
      `Mint-${key}`,
    ]);
  }, [canBurn, canZapInWithOneInch, minterEarningsType]);

  const isStepping = useAppSelector(selectIsStepperStepping);

  const handleMax = useCallback(() => {
    dispatch(
      minterActions.setMax({ balance: depositTokenBalance, decimals: depositToken.decimals })
    );
  }, [depositToken.decimals, depositTokenBalance, dispatch]);

  const handleInput = useCallback(
    (val: string) => {
      dispatch(
        minterActions.setInput({
          val,
          balance: depositTokenBalance,
          decimals: depositToken.decimals,
        })
      );
    },
    [depositToken.decimals, depositTokenBalance, dispatch]
  );

  const handleDeposit = () => {
    if (!isWalletConnected) {
      return dispatch(askForWalletConnection());
    }
    if (!isWalletOnVaultChain) {
      return dispatch(askForNetworkChange({ chainId: vault.chainId }));
    }

    if (depositToken.type !== 'native' && depositTokenAllowance.isLessThan(formData.amount)) {
      dispatch(
        stepperActions.addStep({
          step: {
            step: 'approve',
            message: t('Vault-ApproveMsg'),
            action: walletActions.approval(depositToken, minter.minterAddress, formData.amount),
            pending: false,
          },
        })
      );
    }

    dispatch(
      stepperActions.addStep({
        step: {
          step: 'mint',
          message: t('Vault-TxnConfirm', { type: t('Mint-noun') }),
          action: walletActions.mintDeposit(
            minter,
            depositToken,
            mintedToken,
            formData.amount,
            formData.max
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
        {t(contentKey, {
          mintedToken: minter.mintedToken.symbol,
          depositToken: minter.depositToken.symbol,
        })}
      </div>
      <div className={classes.boxReminder}>
        <div className={classes.content}>
          {t(reminderKey, {
            mintedToken: minter.mintedToken.symbol,
            depositToken: minter.depositToken.symbol,
          })}
        </div>
      </div>
      <div className={classes.inputContainer}>
        <div className={classes.balances}>
          <div className={classes.label}>
            {t('from')} <span className={classes.value}>{depositToken.symbol}</span>
          </div>
          <div className={classes.label}>
            {t('wallet')}{' '}
            <span className={classes.value}>
              {formatTokenDisplayCondensed(depositTokenBalance, depositToken.decimals)}{' '}
              {depositToken.symbol}
            </span>
          </div>
        </div>
        <Paper component="form">
          <div className={classes.inputLogo}>
            <AssetsImage assetSymbols={[minter.depositToken.symbol]} size={24} chainId={chain.id} />
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
            {t('to')} <span className={classes.value}>{mintedToken.symbol}</span>
          </div>
          <div className={classes.label}>
            {t('wallet')}
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
          <InputBase disabled={true} placeholder="0.00" value={formData.input} />
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
              disabled={formData.amount.isLessThanOrEqualTo(0) || isStepping}
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
  );
});
