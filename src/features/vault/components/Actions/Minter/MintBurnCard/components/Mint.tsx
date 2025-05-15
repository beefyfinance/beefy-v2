import { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AssetsImage } from '../../../../../../../components/AssetsImage/AssetsImage.tsx';
import { Button } from '../../../../../../../components/Button/Button.tsx';
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
import { mintDeposit } from '../../../../../../data/actions/wallet/minters.ts';
import { useInputForm } from '../../../../../../data/hooks/input.ts';
import { selectAllowanceByTokenAddress } from '../../../../../../data/selectors/allowances.ts';
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

const useStyles = legacyMakeStyles(styles);

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

  const handleDeposit = () => {
    if (!isWalletConnected) {
      dispatch(askForWalletConnection());
      return;
    }
    if (!isWalletOnVaultChain) {
      dispatch(askForNetworkChange({ chainId: vault.chainId }));
      return;
    }

    if (depositToken.type !== 'native' && depositTokenAllowance.isLessThan(formData.amount)) {
      dispatch(
        stepperAddStep({
          step: {
            step: 'approve',
            message: t('Vault-ApproveMsg'),
            action: approve(depositToken, minter.minterAddress, formData.amount),
            pending: false,
          },
        })
      );
    }

    dispatch(
      stepperAddStep({
        step: {
          step: 'mint',
          message: t('Vault-TxnConfirm', { type: t('Mint-noun') }),
          action: mintDeposit(minter, depositToken, mintedToken, formData.amount, formData.max),
          pending: false,
        },
      })
    );

    dispatch(stepperStart(chain.id));
  };

  return (
    <CardContent css={styles.cardContent}>
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
        <AmountInput
          value={formData.amount}
          maxValue={depositTokenBalance}
          onChange={handleChange}
          endAdornment={
            <Button onClick={handleMax} css={styles.max}>
              {t('Transact-Max')}
            </Button>
          }
          startAdornment={
            <AssetsImage assetSymbols={[minter.depositToken.symbol]} size={24} chainId={chain.id} />
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
        <AmountInput
          value={formData.amount}
          maxValue={depositTokenBalance}
          onChange={handleChange}
          disabled={true}
          startAdornment={
            <AssetsImage assetSymbols={[minter.mintedToken.symbol]} size={24} chainId={chain.id} />
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
              disabled={formData.amount.isLessThanOrEqualTo(0) || isStepping}
              onClick={handleDeposit}
              className={classes.btn}
            >
              {t('action', { action: t('mint'), token: minter.mintedToken.symbol })}
            </Button>

        : <Button onClick={handleConnectWallet} className={classes.btn}>
            {t('Network-ConnectWallet')}
          </Button>
        }
      </>
    </CardContent>
  );
});
