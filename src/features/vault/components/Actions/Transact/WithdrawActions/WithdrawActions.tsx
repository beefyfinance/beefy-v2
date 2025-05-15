import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../../../components/Button/Button.tsx';
import { TenderlyTransactButton } from '../../../../../../components/Tenderly/Buttons/TenderlyTransactButton.tsx';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import {
  transactSteps,
  transactStepsClaimGov,
} from '../../../../../data/actions/wallet/transact.ts';
import type {
  GovComposerZapWithdrawQuote,
  GovVaultWithdrawQuote,
  TransactOption,
  TransactQuote,
} from '../../../../../data/apis/transact/transact-types.ts';
import {
  isGovComposerWithdrawQuote,
  isGovVaultWithdrawQuote,
} from '../../../../../data/apis/transact/transact-types.ts';
import {
  isCowcentratedLikeVault,
  isGovVault,
  type VaultGov,
} from '../../../../../data/entities/vault.ts';
import { TransactStatus } from '../../../../../data/reducers/wallet/transact-types.ts';
import { selectGovVaultPendingRewards } from '../../../../../data/selectors/balance.ts';
import { selectIsStepperStepping } from '../../../../../data/selectors/stepper.ts';
import {
  selectTransactQuoteStatus,
  selectTransactSelectedQuoteOrUndefined,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact.ts';
import {
  selectGovVaultById,
  selectIsVaultGov,
  selectVaultById,
} from '../../../../../data/selectors/vaults.ts';
import { selectWalletAddress } from '../../../../../data/selectors/wallet.ts';
import { ActionConnectSwitch } from '../CommonActions/CommonActions.tsx';
import { ConfirmNotice } from '../ConfirmNotice/ConfirmNotice.tsx';
import { EmeraldGasNotice } from '../EmeraldGasNotice/EmeraldGasNotice.tsx';
import { GlpWithdrawNotice } from '../GlpNotices/GlpNotices.tsx';
import { NotEnoughNotice } from '../NotEnoughNotice/NotEnoughNotice.tsx';
import { PriceImpactNotice } from '../PriceImpactNotice/PriceImpactNotice.tsx';
import { ScreamAvailableLiquidityNotice } from '../ScreamAvailableLiquidityNotice/ScreamAvailableLiquidityNotice.tsx';
import { WithdrawFees } from '../VaultFees/VaultFees.tsx';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

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
    quote &&
    (isGovVaultWithdrawQuote(quote) || isGovComposerWithdrawQuote(quote)) &&
    quoteStatus === TransactStatus.Fulfilled;
  const showClaim = !isCowcentratedLikeVault(vault);

  return (
    <>
      {showWithdraw ?
        <ActionClaimWithdraw quote={quote} vault={vault} />
      : <ActionConnectSwitch
          css={styles.feesContainer}
          FeesComponent={WithdrawFees}
          chainId={vault.chainId}
        >
          <div className={classes.buttons}>
            <ActionWithdrawDisabled />

            <div className={classes.feesContainer}>
              {showClaim ?
                <ActionClaim vault={vault} />
              : null}
              <WithdrawFees />
            </div>
          </div>
        </ActionConnectSwitch>
      }
    </>
  );
});

const ActionWithdrawDisabled = memo(function ActionWithdrawDisabled() {
  const { t } = useTranslation();
  const classes = useStyles();
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  return (
    <div className={classes.feesContainer}>
      <ActionConnectSwitch chainId={vault.chainId}>
        <Button variant="success" disabled={true} fullWidth={true} borderless={true}>
          {t('Transact-Withdraw')}
        </Button>
      </ActionConnectSwitch>
      {!isGovVault(vault) && <WithdrawFees />}
    </div>
  );
});

type ActionWithdrawProps = {
  option: TransactOption;
  quote: TransactQuote;
};
const ActionWithdraw = memo(function ActionWithdraw({ option, quote }: ActionWithdrawProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const classes = useStyles();
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
      {option.chainId === 'emerald' ?
        <EmeraldGasNotice />
      : null}
      <ScreamAvailableLiquidityNotice
        vaultId={option.vaultId}
        onChange={setIsDisabledByScreamLiquidity}
      />
      <GlpWithdrawNotice vaultId={option.vaultId} onChange={setIsDisabledByGlpLock} />
      <PriceImpactNotice quote={quote} onChange={setIsDisabledByPriceImpact} />
      <ConfirmNotice onChange={setIsDisabledByConfirm} />
      <NotEnoughNotice mode="withdraw" onChange={setIsDisabledByNotEnoughInput} />
      <div className={classes.feesContainer}>
        <ActionConnectSwitch chainId={option.chainId}>
          <Button
            variant="success"
            disabled={isDisabled}
            fullWidth={true}
            borderless={true}
            onClick={handleClick}
          >
            {t(
              option.async ? 'Transact-RequestWithdraw'
              : isMaxAll ? 'Transact-WithdrawAll'
              : 'Transact-Withdraw'
            )}
          </Button>
        </ActionConnectSwitch>
        {import.meta.env.DEV ?
          <TenderlyTransactButton option={option} quote={quote} />
        : null}
        <WithdrawFees />
      </div>
    </>
  );
});

type ActionClaimWithdrawProps = {
  quote: GovVaultWithdrawQuote | GovComposerZapWithdrawQuote;
  vault: VaultGov;
};
const ActionClaimWithdraw = memo(function ActionClaimWithdraw({
  quote,
  vault,
}: ActionClaimWithdrawProps) {
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
  const showClaim = !isCowcentratedLikeVault(vault);

  const handleWithdraw = useCallback(() => {
    dispatch(transactSteps(quote, t));
  }, [dispatch, quote, t]);

  return (
    <>
      {option.chainId === 'emerald' ?
        <EmeraldGasNotice />
      : null}
      <PriceImpactNotice quote={quote} onChange={setIsDisabledByPriceImpact} />
      <ConfirmNotice onChange={setIsDisabledByConfirm} />
      <NotEnoughNotice mode="withdraw" onChange={setIsDisabledByNotEnoughInput} />
      <div className={classes.buttons}>
        <ActionConnectSwitch
          FeesComponent={WithdrawFees}
          css={styles.feesContainer}
          chainId={option.chainId}
        >
          <Button
            variant="success"
            disabled={isDisabled}
            fullWidth={true}
            borderless={true}
            onClick={handleWithdraw}
          >
            {t(
              isMaxAll ?
                quote.outputs.length > 1 && showClaim ?
                  'Transact-Claim-WithdrawAll'
                : 'Transact-WithdrawAll'
              : 'Transact-Withdraw'
            )}
          </Button>
          <div className={classes.feesContainer}>
            {showClaim ?
              <ActionClaim vault={vault} />
            : null}
            <WithdrawFees />
          </div>
        </ActionConnectSwitch>
        {import.meta.env.DEV ?
          <TenderlyTransactButton option={option} quote={quote} />
        : null}
      </div>
    </>
  );
});

type ActionClaimProps = {
  vault: VaultGov;
};
const ActionClaim = memo(function ActionClaim({ vault }: ActionClaimProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const walletAddress = useAppSelector(selectWalletAddress);
  const pendingRewards = useAppSelector(state =>
    selectGovVaultPendingRewards(state, vault.id, walletAddress)
  );
  const isTxInProgress = useAppSelector(selectIsStepperStepping);
  const isDisabled = useMemo(() => {
    return isTxInProgress || !pendingRewards.some(r => r.amount.gt(BIG_ZERO));
  }, [pendingRewards, isTxInProgress]);
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
      {t('Transact-Claim-RewardsOnly')}
    </Button>
  );
});
