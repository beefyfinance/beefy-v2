import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AssetsImage } from '../../../../../../../components/AssetsImage/AssetsImage.tsx';
import { Button } from '../../../../../../../components/Button/Button.tsx';
import { UnlimitedApprovalButton } from '../../../../../../../components/UnlimitedApprovalButton/UnlimitedApprovalButton.tsx';
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
import { mintDeposit } from '../../../../../../data/actions/wallet/minters.ts';
import { useInputForm } from '../../../../../../data/hooks/input.ts';
import { useNeedsApproval } from '../../../../../../data/hooks/approval.ts';
import { isTokenErc20 } from '../../../../../../data/entities/token.ts';
import { selectUserBalanceOfToken } from '../../../../../../data/selectors/balance.ts';
import { selectChainById } from '../../../../../../data/selectors/chains.ts';
import {
  selectMinterById,
  selectMinterVaultsType,
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

export const Mint = memo(function Mint({ vaultId, minterId }: MinterCardParams) {
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

  const minterEarningsType = useAppSelector(state => selectMinterVaultsType(state, minterId));

  const { canBurn } = minter;
  const [contentKey, reminderKey] = useMemo(() => {
    const liquidityType = canBurn ? 'Burnable' : 'Liquid';
    const zapType = 'WithoutZap';

    return ['Content', 'Reminder'].map(key => [
      `Mint-${key}-${liquidityType}-${minterEarningsType}-${zapType}`,
      `Mint-${key}-${liquidityType}-${minterEarningsType}`,
      `Mint-${key}-${liquidityType}`,
      `Mint-${key}`,
    ]);
  }, [canBurn, minterEarningsType]);

  const isStepping = useAppSelector(selectIsStepperStepping);
  const isExecuting = useAppSelector(selectTransactExecuting);

  const { handleMax, handleChange, formData } = useInputForm(
    depositTokenBalance,
    depositToken.decimals
  );

  const handleNetworkChange = useCallback(() => {
    dispatch(askForNetworkChange({ chainId: vault.chainId }));
  }, [dispatch, vault]);

  const handleConnectWallet = useCallback(() => {
    dispatch(askForWalletConnection());
  }, [dispatch]);

  const allowances = useMemo(
    () =>
      isTokenErc20(depositToken) ?
        [{ token: depositToken, spenderAddress: minter.minterAddress, amount: formData.amount }]
      : [],
    [depositToken, minter.minterAddress, formData.amount]
  );
  const needsApproval = useNeedsApproval(allowances);
  const offerApprovalChoice = needsApproval && !isStepping && !isExecuting;
  const isDisabled = formData.amount.isLessThanOrEqualTo(0) || isStepping || isExecuting;
  const mintLabel = t('action', { action: t('mint'), token: minter.mintedToken.symbol });

  const deposit = useCallback(
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
          const steps =
            isTokenErc20(depositToken) ?
              await fetchApproveSteps(
                {
                  token: depositToken,
                  spenderAddress: minter.minterAddress,
                  amount: formData.amount,
                },
                t,
                dispatch,
                getState,
                unlimited
              )
            : [];
          steps.push({
            step: 'mint',
            message: t('Vault-TxnConfirm', { type: t('Mint-noun') }),
            action: mintDeposit(minter, depositToken, mintedToken, formData.amount, formData.max),
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
      minter,
      formData.amount,
      formData.max,
      chain.id,
    ]
  );
  const handleDeposit = useCallback(() => deposit(false), [deposit]);
  const handleDepositUnlimited = useCallback(() => deposit(true), [deposit]);

  return (
    <CardContent css={styles.cardContent}>
      <div className={css(styles.content)}>
        {t(contentKey, {
          mintedToken: minter.mintedToken.symbol,
          depositToken: minter.depositToken.symbol,
        })}
      </div>
      <div className={css(styles.boxReminder)}>
        <div className={css(styles.content)}>
          {t(reminderKey, {
            mintedToken: minter.mintedToken.symbol,
            depositToken: minter.depositToken.symbol,
          })}
        </div>
      </div>
      <div className={css(styles.inputContainer)}>
        <div className={css(styles.balances)}>
          <div className={css(styles.label)}>
            {t('from')} <span className={css(styles.value)}>{depositToken.symbol}</span>
          </div>
          <div className={css(styles.label)}>
            {t('wallet')}{' '}
            <span className={css(styles.value)}>
              {formatTokenDisplayCondensed(depositTokenBalance, depositToken.decimals)}{' '}
              {depositToken.symbol}
            </span>
          </div>
        </div>
        <AmountInput
          value={formData.amount}
          maxValue={depositTokenBalance}
          onChange={handleChange}
          endAdornment={
            <Button onClick={handleMax} css={styles.max}>
              {t('Transact-Max')}
            </Button>
          }
          startAdornment={<AssetsImage assets={[depositToken]} size={24} />}
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
            {t('to')} <span className={css(styles.value)}>{mintedToken.symbol}</span>
          </div>
          <div className={css(styles.label)}>
            {t('wallet')}
            <span className={css(styles.value)}>
              {formatTokenDisplayCondensed(mintedTokenBalance, mintedToken.decimals)}{' '}
              {mintedToken.symbol}
            </span>
          </div>
        </div>
        <AmountInput
          value={formData.amount}
          maxValue={depositTokenBalance}
          onChange={handleChange}
          disabled={true}
          startAdornment={<AssetsImage assets={[mintedToken]} size={24} />}
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
                onClick={handleDeposit}
                borderless={true}
                css={styles.btn}
              >
                {offerApprovalChoice ? t('Approve-Exact-And', { action: mintLabel }) : mintLabel}
              </Button>
              {offerApprovalChoice ?
                <UnlimitedApprovalButton
                  action={mintLabel}
                  disabled={isDisabled}
                  onClick={handleDepositUnlimited}
                />
              : null}
            </>

        : <Button onClick={handleConnectWallet} borderless={true} css={styles.btn}>
            {t('Network-ConnectWallet')}
          </Button>
        }
      </>
    </CardContent>
  );
});
