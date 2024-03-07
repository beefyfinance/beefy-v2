import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';
import { memo, useCallback, useMemo, useState } from 'react';
import { Button } from '../../../../../../components/Button';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectTransactQuoteStatus,
  selectTransactSelectedQuoteOrUndefined,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact';
import type {
  GovVaultWithdrawQuote,
  TransactOption,
  TransactQuote,
} from '../../../../../data/apis/transact/transact-types';
import { isGovVaultWithdrawQuote } from '../../../../../data/apis/transact/transact-types';
import { selectIsStepperStepping } from '../../../../../data/selectors/stepper';
import { PriceImpactNotice } from '../PriceImpactNotice';
import { transactSteps, transactStepsClaimGov } from '../../../../../data/actions/transact';
import { EmeraldGasNotice } from '../EmeraldGasNotice';
import { ConfirmNotice } from '../ConfirmNotice';
import { TransactStatus } from '../../../../../data/reducers/wallet/transact-types';
import { selectGovVaultById, selectIsVaultGov } from '../../../../../data/selectors/vaults';
import { type ActionButtonProps, ActionConnectSwitch } from '../CommonActions';
import { selectGovVaultPendingRewardsInToken } from '../../../../../data/selectors/balance';
import type { VaultGov } from '../../../../../data/entities/vault';
import { BIG_ZERO } from '../../../../../../helpers/big-number';
import { GlpWithdrawNotice } from '../GlpNotices';
import { ScreamAvailableLiquidityNotice } from '../ScreamAvailableLiquidityNotice';
import { NotEnoughNotice } from '../NotEnoughNotice';

const useStyles = makeStyles(styles);

export const WithdrawActions = memo(function WithdrawActions() {
  const vaultId = useAppSelector(selectTransactVaultId);
  const isGovVault = useAppSelector(state => selectIsVaultGov(state, vaultId));

  if (isGovVault) {
    return <WithdrawActionsGov />;
  }

  return <WithdrawActionsStandard />;
});

export const WithdrawActionsStandard = memo(function WithdrawActionsStandard() {
  const quoteStatus = useAppSelector(selectTransactQuoteStatus);
  const quote = useAppSelector(selectTransactSelectedQuoteOrUndefined);
  const option = quote ? quote.option : null;

  if (!option || !quote || quoteStatus !== TransactStatus.Fulfilled) {
    return <ActionWithdrawDisabled />;
  }

  return <ActionWithdraw quote={quote} option={option} />;
});

export const WithdrawActionsGov = memo(function WithdrawActionsGov() {
  const classes = useStyles();
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectGovVaultById(state, vaultId));
  const quoteStatus = useAppSelector(selectTransactQuoteStatus);
  const quote = useAppSelector(selectTransactSelectedQuoteOrUndefined);
  const showWithdraw =
    quote && isGovVaultWithdrawQuote(quote) && quoteStatus === TransactStatus.Fulfilled;

  return (
    <>
      {showWithdraw ? (
        <ActionClaimWithdraw quote={quote} vault={vault} />
      ) : (
        <ActionConnectSwitch chainId={vault.chainId}>
          <div className={classes.buttons}>
            <ActionWithdrawDisabled />
            <ActionClaim vault={vault} />
          </div>
        </ActionConnectSwitch>
      )}
    </>
  );
});

const ActionWithdrawDisabled = memo<ActionButtonProps>(function ActionWithdrawDisabled({
  className,
}) {
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
const ActionWithdraw = memo<ActionWithdrawProps>(function ActionWithdraw({ option, quote }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [isDisabledByPriceImpact, setIsDisabledByPriceImpact] = useState(false);
  const [isDisabledByConfirm, setIsDisabledByConfirm] = useState(false);
  const [isDisabledByGlpLock, setIsDisabledByGlpLock] = useState(false);
  const [isDisabledByScreamLiquidity, setIsDisabledByScreamLiquidity] = useState(false);
  const [isDisabledByNotEnoughInput, setIsDisabledByNotEnoughInput] = useState(false);

  const isTxInProgress = useAppSelector(selectIsStepperStepping);
  const isMaxAll = useMemo(() => {
    return quote.inputs.every(tokenAmount => tokenAmount.max === true);
  }, [quote]);

  const isDisabled =
    isTxInProgress ||
    isDisabledByPriceImpact ||
    isDisabledByConfirm ||
    isDisabledByGlpLock ||
    isDisabledByScreamLiquidity ||
    isDisabledByNotEnoughInput;

  const handleClick = useCallback(() => {
    dispatch(transactSteps(quote, t));
  }, [dispatch, quote, t]);

  return (
    <>
      {option.chainId === 'emerald' ? <EmeraldGasNotice /> : null}
      <ScreamAvailableLiquidityNotice
        vaultId={option.vaultId}
        onChange={setIsDisabledByScreamLiquidity}
      />
      <GlpWithdrawNotice vaultId={option.vaultId} onChange={setIsDisabledByGlpLock} />
      <PriceImpactNotice quote={quote} onChange={setIsDisabledByPriceImpact} />
      <ConfirmNotice onChange={setIsDisabledByConfirm} />
      <NotEnoughNotice mode="withdraw" onChange={setIsDisabledByNotEnoughInput} />
      <ActionConnectSwitch chainId={option.chainId}>
        <Button
          variant="success"
          disabled={isDisabled}
          fullWidth={true}
          borderless={true}
          onClick={handleClick}
        >
          {t(isMaxAll ? 'Transact-WithdrawAll' : 'Transact-Withdraw')}
        </Button>
      </ActionConnectSwitch>
    </>
  );
});

type ActionClaimWithdrawProps = {
  quote: GovVaultWithdrawQuote;
  vault: VaultGov;
} & ActionButtonProps;
const ActionClaimWithdraw = memo<ActionClaimWithdrawProps>(function ActionClaimWithdraw({
  quote,
  vault,
}) {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const option = quote.option;
  const [isDisabledByPriceImpact, setIsDisabledByPriceImpact] = useState(false);
  const [isDisabledByConfirm, setIsDisabledByConfirm] = useState(false);
  const [isDisabledByNotEnoughInput, setIsDisabledByNotEnoughInput] = useState(false);

  const isTxInProgress = useAppSelector(selectIsStepperStepping);
  const isMaxAll = useMemo(() => {
    return quote.inputs.every(tokenAmount => tokenAmount.max === true);
  }, [quote]);

  const isDisabled =
    isTxInProgress || isDisabledByPriceImpact || isDisabledByConfirm || isDisabledByNotEnoughInput;

  const handleWithdraw = useCallback(() => {
    dispatch(transactSteps(quote, t));
  }, [dispatch, quote, t]);

  return (
    <>
      {option.chainId === 'emerald' ? <EmeraldGasNotice /> : null}
      <PriceImpactNotice quote={quote} onChange={setIsDisabledByPriceImpact} />
      <ConfirmNotice onChange={setIsDisabledByConfirm} />
      <NotEnoughNotice mode="withdraw" onChange={setIsDisabledByNotEnoughInput} />
      <div className={classes.buttons}>
        <ActionConnectSwitch chainId={option.chainId}>
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
        </ActionConnectSwitch>
      </div>
    </>
  );
});

type ActionClaimProps = {
  vault: VaultGov;
} & ActionButtonProps;
const ActionClaim = memo<ActionClaimProps>(function ActionClaim({ vault }) {
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
