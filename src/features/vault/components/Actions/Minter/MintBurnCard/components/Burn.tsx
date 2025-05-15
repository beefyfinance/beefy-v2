import BigNumber from 'bignumber.js';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertWarning } from '../../../../../../../components/Alerts/Alerts.tsx';
import { AssetsImage } from '../../../../../../../components/AssetsImage/AssetsImage.tsx';
import { Button } from '../../../../../../../components/Button/Button.tsx';
import { fromWei, toWei } from '../../../../../../../helpers/big-number.ts';
import { formatTokenDisplayCondensed } from '../../../../../../../helpers/format.ts';
import { legacyMakeStyles } from '../../../../../../../helpers/mui.ts';
import { useAppDispatch, useAppSelector } from '../../../../../../data/store/hooks.ts';
import iconArrowDown from '../../../../../../../images/icons/arrowDown.svg';
import { stepperStart, stepperAddStep } from '../../../../../../data/actions/wallet/stepper.ts';
import {
  askForNetworkChange,
  askForWalletConnection,
} from '../../../../../../data/actions/wallet.ts';
import { approve } from '../../../../../../data/actions/wallet/approval.ts';
import { burnWithdraw } from '../../../../../../data/actions/wallet/minters.ts';
import { isTokenErc20 } from '../../../../../../data/entities/token.ts';
import { useInputForm } from '../../../../../../data/hooks/input.ts';
import { selectAllowanceByTokenAddress } from '../../../../../../data/selectors/allowances.ts';
import { selectUserBalanceOfToken } from '../../../../../../data/selectors/balance.ts';
import { selectChainById } from '../../../../../../data/selectors/chains.ts';
import {
  selectMinterById,
  selectMinterReserves,
  selectMinterTotalSupply,
} from '../../../../../../data/selectors/minters.ts';
import { selectIsStepperStepping } from '../../../../../../data/selectors/stepper.ts';
import {
  selectErc20TokenByAddress,
  selectTokenByAddress,
} from '../../../../../../data/selectors/tokens.ts';
import { selectVaultById } from '../../../../../../data/selectors/vaults.ts';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
} from '../../../../../../data/selectors/wallet.ts';
import { CardContent } from '../../../../Card/CardContent.tsx';
import { AmountInput } from '../../../Transact/AmountInput/AmountInput.tsx';
import type { MinterCardParams } from '../../MinterCard.tsx';
import { styles } from '../styles.ts';

const useStyles = legacyMakeStyles(styles);
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

  const { handleMax, handleChange, formData } = useInputForm(
    mintedTokenBalance,
    mintedToken.decimals
  );

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

  const handleNetworkChange = useCallback(() => {
    dispatch(askForNetworkChange({ chainId: vault.chainId }));
  }, [dispatch, vault]);

  const handleConnectWallet = useCallback(() => {
    dispatch(askForWalletConnection());
  }, [dispatch]);

  const handleWithdraw = () => {
    if (!isWalletConnected) {
      dispatch(askForWalletConnection());
      return;
    }
    if (!isWalletOnVaultChain) {
      dispatch(askForNetworkChange({ chainId: vault.chainId }));
      return;
    }

    // minted token does not need allowance to burn itself
    if (
      minter.burnerAddress !== mintedToken.address &&
      isTokenErc20(mintedToken) &&
      mintedTokenAllowance.isLessThan(formData.amount)
    ) {
      dispatch(
        stepperAddStep({
          step: {
            step: 'approve',
            message: t('Vault-ApproveMsg'),
            action: approve(mintedToken, minter.burnerAddress!, formData.amount),
            pending: false,
          },
        })
      );
    }
    dispatch(
      stepperAddStep({
        step: {
          step: 'burn',
          message: t('Vault-TxnConfirm', { type: t('Burn') }),
          action: burnWithdraw(
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

    dispatch(stepperStart(chain.id));
  };

  return (
    <CardContent css={styles.cardContent}>
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
      {minter.canBurn === 'reserves' ?
        <div className={classes.boxReserves}>
          <div className={classes.reservesText}>
            {t('reserves', { token: minter.depositToken.symbol })}
          </div>
          <AssetsImage assetSymbols={[minter.depositToken.symbol]} size={24} chainId={chain.id} />
          <div className={classes.amountReserves}>
            {reserves.shiftedBy(-depositToken.decimals).toFixed(2)} {depositToken.symbol}
          </div>
        </div>
      : null}
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
        <AmountInput
          value={formData.amount}
          maxValue={mintedTokenBalance}
          onChange={handleChange}
          endAdornment={
            <Button onClick={handleMax} css={styles.max}>
              {t('Transact-Max')}
            </Button>
          }
          startAdornment={
            <AssetsImage assetSymbols={[minter.mintedToken.symbol]} size={24} chainId={chain.id} />
          }
        />
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
        <AmountInput
          value={outputAmount}
          maxValue={outputAmount}
          allowInputAboveBalance={true}
          disabled={true}
          startAdornment={
            <AssetsImage assetSymbols={[minter.depositToken.symbol]} size={24} chainId={chain.id} />
          }
        />
      </div>
      <>
        {isWalletConnected ?
          !isWalletOnVaultChain ?
            <Button onClick={handleNetworkChange} className={classes.btn}>
              {t('Network-Change', { network: chain.name.toUpperCase() })}
            </Button>
          : <Button
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

        : <Button onClick={handleConnectWallet} className={classes.btn}>
            {t('Network-ConnectWallet')}
          </Button>
        }
      </>
      {formData.amount.isGreaterThan(reserves.shiftedBy(-mintedToken.decimals)) && (
        <AlertWarning css={styles.noReserves}>
          {t('noreserves', { token: minter.depositToken.symbol })}
        </AlertWarning>
      )}
    </CardContent>
  );
});
