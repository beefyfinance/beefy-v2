import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../../../components/Button/Button.tsx';
import { TenderlyTransactButton } from '../../../../../../components/Tenderly/Buttons/TenderlyTransactButton.tsx';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { transactSteps } from '../../../../../data/actions/wallet/transact.ts';
import { crossChainRecoverySteps } from '../../../../../data/actions/wallet/cross-chain.ts';
import {
  isCowcentratedDepositQuote,
  type TransactOption,
  type TransactQuote,
} from '../../../../../data/apis/transact/transact-types.ts';
import { StepContent } from '../../../../../data/reducers/wallet/stepper-types.ts';
import { TransactStatus } from '../../../../../data/reducers/wallet/transact-types.ts';
import {
  selectIsStepperStepping,
  selectStepperBridgeStatus,
  selectStepperStepContent,
} from '../../../../../data/selectors/stepper.ts';
import {
  selectTransactQuoteStatus,
  selectTransactSelectedChainId,
  selectTransactSelectedQuoteOrUndefined,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact.ts';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import {
  ActionConnect,
  ActionConnectSwitch,
  ActionSwitch,
} from '../CommonActions/CommonActions.tsx';
import { ConfirmNotice } from '../ConfirmNotice/ConfirmNotice.tsx';
import { EmeraldGasNotice } from '../EmeraldGasNotice/EmeraldGasNotice.tsx';
import { GlpDepositNotice } from '../GlpNotices/GlpNotices.tsx';
import { MaxNativeNotice } from '../MaxNativeNotice/MaxNativeNotice.tsx';
import { NotEnoughNotice } from '../NotEnoughNotice/NotEnoughNotice.tsx';
import { PriceImpactNotice } from '../PriceImpactNotice/PriceImpactNotice.tsx';
import { VaultFees } from '../VaultFees/VaultFees.tsx';
import { styles } from './styles.ts';
import { getExecutionChainId } from '../../../../../../helpers/transactUtils.ts';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
} from '../../../../../data/selectors/wallet.ts';

const useStyles = legacyMakeStyles(styles);

export const DepositActions = memo(function DepositActions() {
  const quoteStatus = useAppSelector(selectTransactQuoteStatus);
  const quote = useAppSelector(selectTransactSelectedQuoteOrUndefined);
  const option = quote ? quote.option : null;
  const stepperContent = useAppSelector(selectStepperStepContent);

  if (stepperContent === StepContent.RecoveryTx) {
    return <ActionRecoveryDeposit />;
  }

  if (!option || !quote || quoteStatus !== TransactStatus.Fulfilled) {
    return <ActionDepositDisabled />;
  }

  return <ActionDeposit quote={quote} option={option} />;
});

const ActionDepositDisabled = memo(function ActionDepositDisabled() {
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const selectedChainId = useAppSelector(selectTransactSelectedChainId);
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <div className={classes.feesContainer}>
      <ActionConnectSwitch chainId={selectedChainId ?? vault.chainId}>
        <Button variant="cta" disabled={true} fullWidth={true} borderless={true}>
          {t('Transact-Deposit')}
        </Button>
      </ActionConnectSwitch>
      <VaultFees />
    </div>
  );
});

type ActionDepositProps = {
  option: TransactOption;
  quote: TransactQuote;
};
const ActionDeposit = memo(function ActionDeposit({ option, quote }: ActionDepositProps) {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [isDisabledByPriceImpact, setIsDisabledByPriceImpact] = useState(false);
  const [isDisabledByMaxNative, setIsDisabledByMaxNative] = useState(false);
  const [isDisabledByConfirm, setIsDisabledByConfirm] = useState(false);
  const [isDisabledByGlpLock, setIsDisabledByGlpLock] = useState(false);
  const [isDisabledByNotEnoughInput, setIsDisabledByNotEnoughInput] = useState(false);

  const isTxInProgress = useAppSelector(selectIsStepperStepping);
  const isMaxAll = useMemo(() => {
    return quote.inputs.every(tokenAmount => tokenAmount.max === true);
  }, [quote]);
  const isCowDepositQuote = isCowcentratedDepositQuote(quote);
  const executionChainId = useMemo(() => getExecutionChainId(quote), [quote]);

  const isDisabled =
    isTxInProgress ||
    isDisabledByPriceImpact ||
    isDisabledByMaxNative ||
    isDisabledByConfirm ||
    isDisabledByGlpLock ||
    isDisabledByNotEnoughInput;

  const handleClick = useCallback(() => {
    dispatch(transactSteps(quote, t));
  }, [dispatch, quote, t]);

  return (
    <>
      {option.chainId === 'emerald' ?
        <EmeraldGasNotice />
      : null}
      <GlpDepositNotice vaultId={option.vaultId} onChange={setIsDisabledByGlpLock} />
      <PriceImpactNotice
        quote={quote}
        onChange={setIsDisabledByPriceImpact}
        hideCheckbox={isDisabledByNotEnoughInput}
      />
      <MaxNativeNotice quote={quote} onChange={setIsDisabledByMaxNative} />
      <ConfirmNotice onChange={setIsDisabledByConfirm} />
      <NotEnoughNotice mode="deposit" onChange={setIsDisabledByNotEnoughInput} />
      <div className={classes.feesContainer}>
        <ActionConnectSwitch chainId={executionChainId}>
          <Button
            variant="cta"
            disabled={isDisabled}
            fullWidth={true}
            borderless={true}
            onClick={handleClick}
          >
            {t(isMaxAll && !isCowDepositQuote ? 'Transact-DepositAll' : 'Transact-Deposit')}
          </Button>
        </ActionConnectSwitch>
        {import.meta.env.DEV ?
          <TenderlyTransactButton option={option} quote={quote} />
        : null}
        <VaultFees />
      </div>
    </>
  );
});

const ActionRecoveryDeposit = memo(function ActionRecoveryDeposit() {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const bridgeStatus = useAppSelector(selectStepperBridgeStatus);
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const connectedChainId = useAppSelector(selectCurrentChainId);
  const isTxInProgress = useAppSelector(selectIsStepperStepping);
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  const destChainId = bridgeStatus?.destChainId ?? vault.chainId;
  const opId = bridgeStatus?.opId;
  const isOnCorrectChain = connectedChainId === destChainId;

  const handleClick = useCallback(() => {
    if (opId) {
      dispatch(crossChainRecoverySteps(opId, t));
    }
  }, [dispatch, opId, t]);

  if (!isWalletConnected) {
    return (
      <div className={classes.feesContainer}>
        <ActionConnect />
        <VaultFees />
      </div>
    );
  }

  if (!isOnCorrectChain) {
    return (
      <div className={classes.feesContainer}>
        <ActionSwitch
          chainId={destChainId}
          variant="recovery"
          borderless={true}
          buttonText={t('Transact-RecoverySwitchChain')}
        />
        <VaultFees />
      </div>
    );
  }

  return (
    <div className={classes.feesContainer}>
      <Button
        variant="recovery"
        disabled={isTxInProgress || !opId}
        fullWidth={true}
        borderless={true}
        onClick={handleClick}
      >
        {t('Transact-FinaliseDeposit')}
      </Button>
      <VaultFees />
    </div>
  );
});
