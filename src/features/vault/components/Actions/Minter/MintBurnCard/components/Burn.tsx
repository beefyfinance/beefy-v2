import BigNumber from 'bignumber.js';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertWarning } from '../../../../../../../components/Alerts/Alerts.tsx';
import { AssetsImage } from '../../../../../../../components/AssetsImage/AssetsImage.tsx';
import { Button } from '../../../../../../../components/Button/Button.tsx';
import { fromWei, toWei } from '../../../../../../../helpers/big-number.ts';
import { formatTokenDisplayCondensed } from '../../../../../../../helpers/format.ts';
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
import { css } from '@repo/styles/css';
export const Burn = memo(function Burn({ vaultId, minterId }: MinterCardParams) {
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
      <div className={css(styles.content)}>
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
        <div className={css(styles.boxReserves)}>
          <div className={css(styles.reservesText)}>
            {t('reserves', { token: minter.depositToken.symbol })}
          </div>
          <AssetsImage assetSymbols={[minter.depositToken.symbol]} size={24} chainId={chain.id} />
          <div className={css(styles.amountReserves)}>
            {reserves.shiftedBy(-depositToken.decimals).toFixed(2)} {depositToken.symbol}
          </div>
        </div>
      : null}
      <div className={css(styles.inputContainer)}>
        <div className={css(styles.balances)}>
          <div className={css(styles.label)}>
            {t('from')} <span className={css(styles.value)}>{mintedToken.symbol}</span>
          </div>
          <div className={css(styles.label)}>
            {t('wallet')}{' '}
            <span className={css(styles.value)}>
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
      <div className={css(styles.customDivider)}>
        <div className={css(styles.line)} />
        <img alt="arrowDown" src={iconArrowDown} />
        <div className={css(styles.line)} />
      </div>
      <div className={css(styles.inputContainer)}>
        <div className={css(styles.balances)}>
          <div className={css(styles.label)}>
            {t('to')} <span className={css(styles.value)}>{depositToken.symbol}</span>
          </div>
          <div className={css(styles.label)}>
            {t('wallet')}
            <span className={css(styles.value)}>
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
            <Button onClick={handleNetworkChange} borderless={true} css={styles.btn}>
              {t('Network-Change', { network: chain.name.toUpperCase() })}
            </Button>
          : <Button
              disabled={
                formData.amount.isGreaterThan(reserves.shiftedBy(-mintedToken.decimals)) ||
                formData.amount.isLessThanOrEqualTo(0) ||
                isStepping
              }
              onClick={handleWithdraw}
              borderless={true}
              css={styles.btn}
            >
              {t('action', { action: t('burn'), token: minter.mintedToken.symbol })}
            </Button>

        : <Button onClick={handleConnectWallet} borderless={true} css={styles.btn}>
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
