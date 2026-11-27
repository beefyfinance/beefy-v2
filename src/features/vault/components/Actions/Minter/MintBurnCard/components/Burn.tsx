import BigNumber from 'bignumber.js';
import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertWarning } from '../../../../../../../components/Alerts/Alerts.tsx';
import { AssetsImage } from '../../../../../../../components/AssetsImage/AssetsImage.tsx';
import { Button } from '../../../../../../../components/Button/Button.tsx';
import { UnlimitedApprovalButton } from '../../../../../../../components/UnlimitedApprovalButton/UnlimitedApprovalButton.tsx';
import { fromWei, toWei } from '../../../../../../../helpers/big-number.ts';
import { formatTokenDisplayCondensed } from '../../../../../../../helpers/format.ts';
import { useAppDispatch, useAppSelector } from '../../../../../../data/store/hooks.ts';
import iconArrowDown from '../../../../../../../images/icons/arrowDown.svg';
import { stepperStartWithSteps } from '../../../../../../data/actions/wallet/stepper.ts';
import { transactSetExecuting } from '../../../../../../data/actions/transact.ts';
import { selectTransactExecuting } from '../../../../../../data/selectors/transact.ts';
import {
  askForNetworkChange,
  askForWalletConnection,
} from '../../../../../../data/actions/wallet.ts';
import { fetchApproveSteps } from '../../../../../../data/actions/wallet/approval.ts';
import { burnWithdraw } from '../../../../../../data/actions/wallet/minters.ts';
import { isTokenErc20 } from '../../../../../../data/entities/token.ts';
import { useInputForm } from '../../../../../../data/hooks/input.ts';
import { useNeedsApproval } from '../../../../../../data/hooks/approval.ts';
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
  const reserves = useAppSelector(state => selectMinterReserves(state, minter.id));
  const totalSupply = useAppSelector(state => selectMinterTotalSupply(state, minter.id));
  const isStepping = useAppSelector(selectIsStepperStepping);
  const isExecuting = useAppSelector(selectTransactExecuting);

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

  const allowances = useMemo(
    () =>
      minter.burnerAddress !== mintedToken.address && isTokenErc20(mintedToken) ?
        [{ token: mintedToken, spenderAddress: minter.burnerAddress!, amount: formData.amount }]
      : [],
    [minter.burnerAddress, mintedToken, formData.amount]
  );
  const needsApproval = useNeedsApproval(allowances);
  const offerApprovalChoice = needsApproval && !isStepping && !isExecuting;
  const isDisabled =
    formData.amount.isGreaterThan(reserves.shiftedBy(-mintedToken.decimals)) ||
    formData.amount.isLessThanOrEqualTo(0) ||
    isStepping ||
    isExecuting;
  const burnLabel = t('action', { action: t('burn'), token: minter.mintedToken.symbol });

  const withdraw = useCallback(
    (unlimited: boolean) => {
      if (!isWalletConnected) {
        dispatch(askForWalletConnection());
        return;
      }
      if (!isWalletOnVaultChain) {
        dispatch(askForNetworkChange({ chainId: vault.chainId }));
        return;
      }

      dispatch(async (dispatch, getState) => {
        dispatch(transactSetExecuting(true));
        try {
          // minted token does not need allowance to burn itself
          const steps =
            minter.burnerAddress !== mintedToken.address && isTokenErc20(mintedToken) ?
              await fetchApproveSteps(
                {
                  token: mintedToken,
                  spenderAddress: minter.burnerAddress!,
                  amount: formData.amount,
                },
                t,
                dispatch,
                getState,
                unlimited
              )
            : [];
          steps.push({
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
          });
          dispatch(stepperStartWithSteps(steps, chain.id));
        } finally {
          dispatch(transactSetExecuting(false));
        }
      });
    },
    [
      dispatch,
      t,
      isWalletConnected,
      isWalletOnVaultChain,
      vault.chainId,
      depositToken,
      mintedToken,
      minter.burnerAddress,
      minterId,
      formData.amount,
      formData.max,
      chain.id,
    ]
  );
  const handleWithdraw = useCallback(() => withdraw(false), [withdraw]);
  const handleWithdrawUnlimited = useCallback(() => withdraw(true), [withdraw]);

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
          <AssetsImage assets={[depositToken]} size={24} />
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
          startAdornment={<AssetsImage assets={[mintedToken]} size={24} />}
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
          startAdornment={<AssetsImage assets={[depositToken]} size={24} />}
        />
      </div>
      <>
        {isWalletConnected ?
          !isWalletOnVaultChain ?
            <Button onClick={handleNetworkChange} borderless={true} css={styles.btn}>
              {t('Network-Change', { network: chain.name.toUpperCase() })}
            </Button>
          : <>
              <Button
                disabled={isDisabled}
                onClick={handleWithdraw}
                borderless={true}
                css={styles.btn}
              >
                {offerApprovalChoice ? t('Approve-Exact-And', { action: burnLabel }) : burnLabel}
              </Button>
              {offerApprovalChoice ?
                <UnlimitedApprovalButton
                  action={burnLabel}
                  disabled={isDisabled}
                  onClick={handleWithdrawUnlimited}
                />
              : null}
            </>

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
