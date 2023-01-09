import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';
import { memo, useCallback, useMemo, useState } from 'react';
import { Button } from '../../../../../../components/Button';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectTransactOptionById,
  selectTransactQuoteStatus,
  selectTransactSelectedQuote,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact';
import {
  selectCurrentChainId,
  selectIsWalletConnected,
} from '../../../../../data/selectors/wallet';
import {
  GovVaultQuote,
  isGovVaultQuote,
  TransactOption,
  TransactQuote,
} from '../../../../../data/apis/transact/transact-types';
import { selectIsStepperStepping } from '../../../../../data/selectors/stepper';
import { PriceImpactNotice } from '../PriceImpactNotice';
import { transactSteps, transactStepsClaimGov } from '../../../../../data/actions/transact';
import { EmeraldGasNotice } from '../EmeraldGasNotice';
import { ConfirmNotice } from '../ConfirmNotice';
import { TransactStatus } from '../../../../../data/reducers/wallet/transact-types';
import { selectGovVaultById, selectIsVaultGov } from '../../../../../data/selectors/vaults';
import { ActionButtonProps, ActionConnect, ActionSwitch } from '../CommonActions';
import { selectGovVaultPendingRewardsInToken } from '../../../../../data/selectors/balance';
import { VaultGov } from '../../../../../data/entities/vault';
import { BIG_ZERO } from '../../../../../../helpers/big-number';
import { GlpWithdrawNotice } from '../GlpNotices';

const useStyles = makeStyles(styles);

export type WithdrawActionsProps = {};
export const WithdrawActions = memo<WithdrawActionsProps>(function WithdrawActions() {
  const vaultId = useAppSelector(selectTransactVaultId);
  const isGovVault = useAppSelector(state => selectIsVaultGov(state, vaultId));

  if (isGovVault) {
    return <WithdrawActionsGov />;
  }

  return <WithdrawActionsStandard />;
});

export const WithdrawActionsStandard = memo<WithdrawActionsProps>(
  function WithdrawActionsStandard() {
    const quoteStatus = useAppSelector(selectTransactQuoteStatus);
    const quote = useAppSelector(selectTransactSelectedQuote);
    const option = useAppSelector(state =>
      quote ? selectTransactOptionById(state, quote.optionId) : null
    );
    const isWalletConnected = useAppSelector(selectIsWalletConnected);
    const connectedChainId = useAppSelector(selectCurrentChainId);

    if (!isWalletConnected) {
      return <ActionConnect />;
    }

    if (option && option.chainId !== connectedChainId) {
      return <ActionSwitch chainId={option.chainId} />;
    }

    if (!option || !quote || quoteStatus !== TransactStatus.Fulfilled) {
      return <ActionWithdrawDisabled />;
    }

    return <ActionWithdraw quote={quote} option={option} />;
  }
);

export const WithdrawActionsGov = memo<WithdrawActionsProps>(function WithdrawActionsGov() {
  const classes = useStyles();
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectGovVaultById(state, vaultId));
  const quoteStatus = useAppSelector(selectTransactQuoteStatus);
  const quote = useAppSelector(selectTransactSelectedQuote);
  const option = useAppSelector(state =>
    quote ? selectTransactOptionById(state, quote.optionId) : null
  );
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const connectedChainId = useAppSelector(selectCurrentChainId);
  const isVaultChain = connectedChainId === vault.chainId;
  const showWithdraw =
    option && quote && isGovVaultQuote(quote) && quoteStatus === TransactStatus.Fulfilled;

  if (!isWalletConnected) {
    return <ActionConnect />;
  }

  // This will need changed if we ever support x-chain zapping in to gov vault
  if (!isVaultChain) {
    return <ActionSwitch chainId={vault.chainId} />;
  }

  return (
    <>
      {showWithdraw ? (
        <ActionClaimWithdraw quote={quote} option={option} vault={vault} />
      ) : (
        <div className={classes.buttons}>
          <ActionWithdrawDisabled />
          <ActionClaim vault={vault} />
        </div>
      )}
    </>
  );
});

const ActionWithdrawDisabled = memo<ActionButtonProps>(function ({ className }) {
  const { t } = useTranslation();

  return (
    <Button
      variant="success"
      disabled={true}
      fullWidth={true}
      borderless={true}
      className={className}
    >
      {t('Transact-Withdraw')}
    </Button>
  );
});

type ActionWithdrawProps = {
  option: TransactOption;
  quote: TransactQuote;
} & ActionButtonProps;
const ActionWithdraw = memo<ActionWithdrawProps>(function ({ option, quote, className }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [isDisabledByPriceImpact, setIsDisabledByPriceImpact] = useState(false);
  const [isDisabledByConfirm, setIsDisabledByConfirm] = useState(false);
  const [isDisabledByGlpLock, setIsDisabledByGlpLock] = useState(false);
  const isTxInProgress = useAppSelector(selectIsStepperStepping);
  const isMaxAll = useMemo(() => {
    return quote.inputs.every(tokenAmount => tokenAmount.max === true);
  }, [quote]);
  const isDisabled =
    isTxInProgress || isDisabledByPriceImpact || isDisabledByConfirm || isDisabledByGlpLock;
  const handleClick = useCallback(() => {
    dispatch(transactSteps(quote, t));
  }, [dispatch, quote, t]);

  return (
    <>
      {option.chainId === 'emerald' ? <EmeraldGasNotice /> : null}
      <GlpWithdrawNotice vaultId={option.vaultId} onChange={setIsDisabledByGlpLock} />
      <PriceImpactNotice quote={quote} onChange={setIsDisabledByPriceImpact} />
      <ConfirmNotice onChange={setIsDisabledByConfirm} />
      <Button
        variant="success"
        disabled={isDisabled}
        fullWidth={true}
        borderless={true}
        onClick={handleClick}
      >
        {t(isMaxAll ? 'Transact-WithdrawAll' : 'Transact-Withdraw')}
      </Button>
    </>
  );
});

type ActionClaimWithdrawProps = {
  option: TransactOption;
  quote: GovVaultQuote;
  vault: VaultGov;
} & ActionButtonProps;
const ActionClaimWithdraw = memo<ActionClaimWithdrawProps>(function ({
  option,
  quote,
  vault,
  className,
}) {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [isDisabledByPriceImpact, setIsDisabledByPriceImpact] = useState(false);
  const [isDisabledByConfirm, setIsDisabledByConfirm] = useState(false);
  const isTxInProgress = useAppSelector(selectIsStepperStepping);
  const isMaxAll = useMemo(() => {
    return quote.inputs.every(tokenAmount => tokenAmount.max === true);
  }, [quote]);
  const isDisabled = isTxInProgress || isDisabledByPriceImpact || isDisabledByConfirm;
  const handleWithdraw = useCallback(() => {
    dispatch(transactSteps(quote, t));
  }, [dispatch, quote, t]);

  return (
    <>
      {option.chainId === 'emerald' ? <EmeraldGasNotice /> : null}
      <PriceImpactNotice quote={quote} onChange={setIsDisabledByPriceImpact} />
      <ConfirmNotice onChange={setIsDisabledByConfirm} />
      <div className={classes.buttons}>
        <Button
          variant="success"
          disabled={isDisabled}
          fullWidth={true}
          borderless={true}
          onClick={handleWithdraw}
        >
          {t(
            isMaxAll
              ? quote.outputs.length > 1
                ? 'Transact-ClaimWithdrawAll'
                : 'Transact-WithdrawAll'
              : 'Transact-Withdraw'
          )}
        </Button>
        <ActionClaim vault={vault} />
      </div>
    </>
  );
});

type ActionClaimProps = {
  vault: VaultGov;
} & ActionButtonProps;
const ActionClaim = memo<ActionClaimProps>(function ({ vault, className }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const pendingRewards = useAppSelector(state =>
    selectGovVaultPendingRewardsInToken(state, vault.id)
  );
  const isTxInProgress = useAppSelector(selectIsStepperStepping);
  const isDisabled = isTxInProgress || pendingRewards.lte(BIG_ZERO);
  const handleClaim = useCallback(() => {
    dispatch(transactStepsClaimGov(vault, t));
  }, [dispatch, vault, t]);

  return (
    <Button
      variant="success"
      disabled={isDisabled}
      fullWidth={true}
      borderless={true}
      onClick={handleClaim}
    >
      {t('Transact-ClaimRewards')}
    </Button>
  );
});
