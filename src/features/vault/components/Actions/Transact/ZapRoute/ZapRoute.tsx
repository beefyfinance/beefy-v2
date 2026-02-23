import { css, type CssStyles } from '@repo/styles/css';
import type { ComponentType, ReactNode } from 'react';
import { Fragment, memo, useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ChainIcon } from '../../../../../../components/ChainIcon/ChainIcon.tsx';
import { SpinLoader } from '../../../../../../components/SpinLoader/SpinLoader.tsx';
import { ListJoin } from '../../../../../../components/ListJoin.tsx';
import { TokenAmountFromEntity } from '../../../../../../components/TokenAmount/TokenAmount.tsx';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { transactSwitchStep } from '../../../../../data/actions/transact.ts';
import {
  type AllowanceTokenAmount,
  isCowcentratedDepositQuote,
  type TokenAmount,
  type ZapQuote,
  type ZapQuoteStep,
  type ZapQuoteStepBuild,
  type ZapQuoteStepDeposit,
  type ZapQuoteStepSplit,
  type ZapQuoteStepStake,
  type ZapQuoteStepSwap,
  type ZapQuoteStepUnstake,
  type ZapQuoteStepUnused,
  type ZapQuoteStepWithdraw,
  type ZapQuoteStepBridge,
} from '../../../../../data/apis/transact/transact-types.ts';
import type { ChainEntity } from '../../../../../data/entities/chain.ts';
import { StepContent } from '../../../../../data/reducers/wallet/stepper-types.ts';
import { TransactStep } from '../../../../../data/reducers/wallet/transact-types.ts';
import {
  selectIsStepperStepping,
  selectStepperCurrentStep,
  selectStepperStepContent,
} from '../../../../../data/selectors/stepper.ts';
import { selectPendingAllowances } from '../../../../../data/selectors/allowances.ts';
import { selectChainById } from '../../../../../data/selectors/chains.ts';
import { selectTransactQuoteIds } from '../../../../../data/selectors/transact.ts';
import { selectZapSwapProviderName } from '../../../../../data/selectors/zap.ts';
import { QuoteTitle } from '../QuoteTitle/QuoteTitle.tsx';
import { styles } from './styles.ts';
import CheckmarkIcon from '../../../../../../images/icons/checkmark.svg?react';
import PlayIcon from '../../../../../../images/icons/play.svg?react';

export type StepStatusState = 'list' | 'finished' | 'inProgress' | 'notStarted' | 'failed';

function getStepChainId(step: ZapQuoteStep): ChainEntity['id'] | undefined {
  switch (step.type) {
    case 'swap':
      return step.fromToken.chainId;
    case 'bridge':
      return step.toChainId;
    case 'build':
    case 'deposit':
    case 'stake':
      return step.inputs[0]?.token.chainId;
    case 'withdraw':
    case 'unstake':
    case 'split':
    case 'unused':
      return step.outputs[0]?.token.chainId;
    default:
      return undefined;
  }
}

const StepStatusIndicator = memo(function StepStatusIndicator({
  status,
  number,
}: {
  status: StepStatusState;
  number: number;
}) {
  switch (status) {
    case 'list':
      return (
        <div className={css(styles.statusBase, styles.statusList)}>
          <span>{number}</span>
        </div>
      );
    case 'finished':
      return (
        <div className={css(styles.statusBase, styles.statusFinished)}>
          <CheckmarkIcon />
        </div>
      );
    case 'failed':
      return (
        <div className={css(styles.statusBase, styles.statusInProgress)}>
          <PlayIcon />
        </div>
      );
    case 'inProgress':
      return (
        <div className={css(styles.statusBase, styles.statusNotStarted)}>
          <SpinLoader />
        </div>
      );
    case 'notStarted':
      return <div className={css(styles.statusBase, styles.statusNotStarted)} />;
  }
});

function useTokenAmounts(tokenAmounts: TokenAmount[]): ReactNode[] {
  return useMemo(() => {
    return tokenAmounts.map(tokenAmount => (
      <Fragment key={`${tokenAmount.token.chainId}-${tokenAmount.token.address}`}>
        <TokenAmountFromEntity amount={tokenAmount.amount} token={tokenAmount.token} />{' '}
        {tokenAmount.token.symbol}
      </Fragment>
    ));
  }, [tokenAmounts]);
}

function useChainName(chainId: ChainEntity['id'] | undefined): string {
  return useAppSelector(state => (chainId ? selectChainById(state, chainId).name : ''));
}

type StepContentProps<T extends ZapQuoteStep> = {
  step: T;
  css?: CssStyles;
  chainId?: ChainEntity['id'];
};

const ApprovalStepContent = memo(function ApprovalStepContent({
  allowance,
}: {
  allowance: AllowanceTokenAmount;
}) {
  const { t } = useTranslation();
  const chainId = allowance.token.chainId;
  const chainName = useChainName(chainId);

  return (
    <Trans
      t={t}
      i18nKey="Transact-Route-Step-Approval"
      values={{
        fromToken: allowance.token.symbol,
        chainName,
      }}
      components={{
        fromAmount: <TokenAmountFromEntity amount={allowance.amount} token={allowance.token} />,
        chain: <ChainIcon chainId={chainId} size={16} css={styles.chainIcon} />,
      }}
    />
  );
});

type ApprovalStepProps = {
  allowance: AllowanceTokenAmount;
  number: number;
  status: StepStatusState;
};
const ApprovalStep = memo(function ApprovalStep({ allowance, number, status }: ApprovalStepProps) {
  return (
    <div className={css(styles.stepRow)}>
      <div className={css(styles.stepStatusWrapper)}>
        <StepStatusIndicator status={status} number={number} />
      </div>
      <div className={css(styles.stepContent)}>
        <ApprovalStepContent allowance={allowance} />
      </div>
    </div>
  );
});

const StepContentSwap = memo(function StepContentSwap({
  step,
  chainId,
}: StepContentProps<ZapQuoteStepSwap>) {
  const { t } = useTranslation();
  const { providerId, via } = step;
  const platformName = useAppSelector(state =>
    selectZapSwapProviderName(state, providerId, via, t)
  );
  const chainName = useChainName(chainId);
  const textKey =
    via === 'aggregator' && providerId === 'wnative' ?
      step.toToken.type === 'native' ?
        'Transact-Route-Step-Unwrap'
      : 'Transact-Route-Step-Wrap'
    : 'Transact-Route-Step-Swap';

  return (
    <Trans
      t={t}
      i18nKey={textKey}
      values={{
        fromToken: step.fromToken.symbol,
        toToken: step.toToken.symbol,
        via: platformName,
        chainName,
      }}
      components={{
        fromAmount: <TokenAmountFromEntity amount={step.fromAmount} token={step.fromToken} />,
        toAmount: <TokenAmountFromEntity amount={step.toAmount} token={step.toToken} />,
        chain: chainId ? <ChainIcon chainId={chainId} size={16} css={styles.chainIcon} /> : <></>,
      }}
    />
  );
});

const StepContentBuild = memo(function StepContentBuild({
  step,
  chainId,
}: StepContentProps<ZapQuoteStepBuild>) {
  const { t } = useTranslation();
  const chainName = useChainName(chainId);
  const tokenAmounts = useTokenAmounts(step.inputs);

  return (
    <Trans
      t={t}
      i18nKey="Transact-Route-Step-Build"
      values={{ chainName }}
      components={{
        tokenAmounts: <ListJoin items={tokenAmounts} />,
        chain: chainId ? <ChainIcon chainId={chainId} size={16} css={styles.chainIcon} /> : <></>,
      }}
    />
  );
});

const StepContentDeposit = memo(function StepContentDeposit({
  step,
  chainId,
}: StepContentProps<ZapQuoteStepDeposit>) {
  const { t } = useTranslation();
  const chainName = useChainName(chainId);
  const tokenAmounts = useTokenAmounts(step.inputs);
  return (
    <Trans
      t={t}
      i18nKey="Transact-Route-Step-Deposit"
      values={{ chainName }}
      components={{
        tokenAmounts: <ListJoin items={tokenAmounts} />,
        chain: chainId ? <ChainIcon chainId={chainId} size={16} css={styles.chainIcon} /> : <></>,
      }}
    />
  );
});

const StepContentStake = memo(function StepContentStake({
  step,
  chainId,
}: StepContentProps<ZapQuoteStepStake>) {
  const { t } = useTranslation();
  const chainName = useChainName(chainId);
  const tokenAmounts = useTokenAmounts(step.inputs);
  return (
    <Trans
      t={t}
      i18nKey="Transact-Route-Step-Stake"
      values={{ chainName }}
      components={{
        tokenAmounts: <ListJoin items={tokenAmounts} />,
        chain: chainId ? <ChainIcon chainId={chainId} size={16} css={styles.chainIcon} /> : <></>,
      }}
    />
  );
});

const StepContentUnstake = memo(function StepContentUnstake({
  step,
  chainId,
}: StepContentProps<ZapQuoteStepUnstake>) {
  const { t } = useTranslation();
  const chainName = useChainName(chainId);
  const tokenAmounts = useTokenAmounts(step.outputs);

  return (
    <Trans
      t={t}
      i18nKey="Transact-Route-Step-Unstake"
      values={{ chainName }}
      components={{
        tokenAmounts: <ListJoin items={tokenAmounts} />,
        chain: chainId ? <ChainIcon chainId={chainId} size={16} css={styles.chainIcon} /> : <></>,
      }}
    />
  );
});

const StepContentWithdraw = memo(function StepContentWithdraw({
  step,
  chainId,
}: StepContentProps<ZapQuoteStepWithdraw>) {
  const { t } = useTranslation();
  const chainName = useChainName(chainId);
  const tokenAmounts = useTokenAmounts(step.outputs);

  return (
    <Trans
      t={t}
      i18nKey="Transact-Route-Step-Withdraw"
      values={{ chainName }}
      components={{
        tokenAmounts: <ListJoin items={tokenAmounts} />,
        chain: chainId ? <ChainIcon chainId={chainId} size={16} css={styles.chainIcon} /> : <></>,
      }}
    />
  );
});

const StepContentSplit = memo(function StepContentSplit({
  step,
  chainId,
}: StepContentProps<ZapQuoteStepSplit>) {
  const { t } = useTranslation();
  const chainName = useChainName(chainId);
  const tokenAmounts = useTokenAmounts(step.outputs);

  return (
    <Trans
      t={t}
      i18nKey="Transact-Route-Step-Split"
      values={{ chainName }}
      components={{
        tokenAmounts: <ListJoin items={tokenAmounts} />,
        chain: chainId ? <ChainIcon chainId={chainId} size={16} css={styles.chainIcon} /> : <></>,
      }}
    />
  );
});

const StepContentUnused = memo(function StepContentUnused({
  step,
}: StepContentProps<ZapQuoteStepUnused>) {
  const { t } = useTranslation();
  const tokenAmounts = useMemo(() => {
    return step.outputs.map(tokenAmount => (
      <Fragment key={`${tokenAmount.token.chainId}-${tokenAmount.token.address}`}>
        <TokenAmountFromEntity amount={tokenAmount.amount} token={tokenAmount.token} />{' '}
        {tokenAmount.token.symbol}
      </Fragment>
    ));
  }, [step]);

  return (
    <>
      <Trans
        t={t}
        i18nKey="Transact-Route-Step-Unused"
        components={{
          tokenAmounts: <ListJoin items={tokenAmounts} />,
        }}
      />
    </>
  );
});

const StepContentBridge = memo(function StepContentBridge({
  step,
  chainId,
}: StepContentProps<ZapQuoteStepBridge>) {
  const { t } = useTranslation();
  const chainName = useChainName(chainId);

  return (
    <Trans
      t={t}
      i18nKey="Transact-Route-Step-Bridge"
      values={{
        fromToken: step.fromToken.symbol,
        chainName,
      }}
      components={{
        fromAmount: <TokenAmountFromEntity amount={step.fromAmount} token={step.fromToken} />,
        chain: chainId ? <ChainIcon chainId={chainId} size={16} css={styles.chainIcon} /> : <></>,
      }}
    />
  );
});

type StepContentMap = {
  [K in ZapQuoteStep as K['type']]: ComponentType<StepContentProps<K>>;
};

const StepContentComponents: StepContentMap = {
  swap: StepContentSwap,
  build: StepContentBuild,
  deposit: StepContentDeposit,
  withdraw: StepContentWithdraw,
  split: StepContentSplit,
  unused: StepContentUnused,
  stake: StepContentStake,
  unstake: StepContentUnstake,
  bridge: StepContentBridge,
};

function useStepStatuses(stepsCount: number): StepStatusState[] {
  const isStepping = useAppSelector(selectIsStepperStepping);
  const stepperContent = useAppSelector(selectStepperStepContent);
  const currentStepIndex = useAppSelector(selectStepperCurrentStep);

  return useMemo(() => {
    if (!isStepping && stepperContent !== StepContent.SuccessTx) {
      return Array(stepsCount).fill('list') as StepStatusState[];
    }

    if (stepperContent === StepContent.SuccessTx) {
      return Array(stepsCount).fill('finished') as StepStatusState[];
    }

    return Array.from({ length: stepsCount }, (_, i) => {
      if (i < currentStepIndex) return 'finished';
      if (i === currentStepIndex) return 'inProgress';
      return 'notStarted';
    }) as StepStatusState[];
  }, [isStepping, stepperContent, currentStepIndex, stepsCount]);
}

type StepProps = {
  step: ZapQuoteStep;
  number: number;
  status: StepStatusState;
};
const Step = memo(function Step({ step, number, status }: StepProps) {
  const Component = StepContentComponents[step.type] as ComponentType<
    StepContentProps<ZapQuoteStep>
  >;
  const chainId = getStepChainId(step);

  return (
    <div className={css(styles.stepRow)}>
      <div className={css(styles.stepStatusWrapper)}>
        <StepStatusIndicator status={status} number={number} />
      </div>
      <div className={css(styles.stepContent)}>
        <Component step={step} chainId={chainId} />
      </div>
    </div>
  );
});

export type ZapRouteProps = {
  quote: ZapQuote;
  css?: CssStyles;
};
export const ZapRoute = memo(function ZapRoute({ quote, css: cssProp }: ZapRouteProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const quotes = useAppSelector(selectTransactQuoteIds);
  const hasMultipleOptions = quotes.length > 1;
  const pendingAllowances: AllowanceTokenAmount[] = useAppSelector(state =>
    selectPendingAllowances(state, quote.allowances)
  );
  const approvalCount = pendingAllowances.length;
  const totalSteps = approvalCount + quote.steps.length;
  const stepStatuses = useStepStatuses(totalSteps);
  const handleSwitch = useCallback(() => {
    dispatch(transactSwitchStep(TransactStep.QuoteSelect));
  }, [dispatch]);

  if (
    isCowcentratedDepositQuote(quote) &&
    quote.outputs.every(output => output.amount.lte(BIG_ZERO))
  ) {
    return null;
  }

  return (
    <div className={css(cssProp)}>
      <div className={css(styles.title)}>{t('Transact-ZapRoute')}</div>
      <div className={css(styles.routeHolder)}>
        <div
          className={css(styles.routeHeader, hasMultipleOptions && styles.routerHeaderClickable)}
          onClick={hasMultipleOptions ? handleSwitch : undefined}
        >
          <QuoteTitle quote={quote} />
          {hasMultipleOptions ? '>' : undefined}
        </div>
        <div className={css(styles.routeContent)}>
          <div className={css(styles.steps)}>
            {pendingAllowances.map((allowance, i) => (
              <ApprovalStep
                allowance={allowance}
                key={`approval-${allowance.token.address}`}
                number={i + 1}
                status={stepStatuses[i]}
              />
            ))}
            {quote.steps.map((step, i) => (
              <Step
                step={step}
                key={i}
                number={approvalCount + i + 1}
                status={stepStatuses[approvalCount + i]}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
