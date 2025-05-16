import { css, type CssStyles } from '@repo/styles/css';
import type { ComponentType, ReactNode } from 'react';
import { Fragment, memo, useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ListJoin } from '../../../../../../components/ListJoin.tsx';
import { TokenAmountFromEntity } from '../../../../../../components/TokenAmount/TokenAmount.tsx';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { transactSwitchStep } from '../../../../../data/actions/transact.ts';
import {
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
} from '../../../../../data/apis/transact/transact-types.ts';
import { TransactStep } from '../../../../../data/reducers/wallet/transact-types.ts';
import { selectPlatformById } from '../../../../../data/selectors/platforms.ts';
import { selectTransactQuoteIds } from '../../../../../data/selectors/transact.ts';
import { selectZapSwapProviderName } from '../../../../../data/selectors/zap.ts';
import { QuoteTitle } from '../QuoteTitle/QuoteTitle.tsx';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

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

type StepContentProps<T extends ZapQuoteStep> = {
  step: T;
  css?: CssStyles;
};

const StepContentSwap = memo(function StepContentSwap({
  step,
}: StepContentProps<ZapQuoteStepSwap>) {
  const { t } = useTranslation();
  const { providerId, via } = step;
  const platformName = useAppSelector(state =>
    selectZapSwapProviderName(state, providerId, via, t)
  );
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
      }}
      components={{
        fromAmount: <TokenAmountFromEntity amount={step.fromAmount} token={step.fromToken} />,
        toAmount: <TokenAmountFromEntity amount={step.toAmount} token={step.toToken} />,
      }}
    />
  );
});

const StepContentBuild = memo(function StepContentBuild({
  step,
}: StepContentProps<ZapQuoteStepBuild>) {
  const { t } = useTranslation();
  const provider = useAppSelector(state => {
    const id = step.providerId || step.outputToken.providerId;
    return id ? selectPlatformById(state, id) : undefined;
  });
  const tokenAmounts = useTokenAmounts(step.inputs);

  return (
    <>
      <Trans
        t={t}
        i18nKey="Transact-Route-Step-Build"
        values={{
          provider: provider ? provider.name : 'underlying platform',
        }}
        components={{
          tokenAmounts: <ListJoin items={tokenAmounts} />,
        }}
      />
    </>
  );
});

const StepContentDeposit = memo(function StepContentDeposit({
  step,
}: StepContentProps<ZapQuoteStepDeposit>) {
  const { t } = useTranslation();
  const tokenAmounts = useTokenAmounts(step.inputs);
  return (
    <Trans
      t={t}
      i18nKey="Transact-Route-Step-Deposit"
      components={{
        tokenAmounts: <ListJoin items={tokenAmounts} />,
      }}
    />
  );
});

const StepContentStake = memo(function StepContentStake({
  step,
}: StepContentProps<ZapQuoteStepStake>) {
  const { t } = useTranslation();
  const tokenAmounts = useTokenAmounts(step.inputs);
  return (
    <Trans
      t={t}
      i18nKey="Transact-Route-Step-Stake"
      components={{
        tokenAmounts: <ListJoin items={tokenAmounts} />,
      }}
    />
  );
});

const StepContentUnstake = memo(function StepContentUnstake({
  step,
}: StepContentProps<ZapQuoteStepUnstake>) {
  const { t } = useTranslation();
  const tokenAmounts = useTokenAmounts(step.outputs);

  return (
    <Trans
      t={t}
      i18nKey="Transact-Route-Step-Unstake"
      components={{
        tokenAmounts: <ListJoin items={tokenAmounts} />,
      }}
    />
  );
});

const StepContentWithdraw = memo(function StepContentWithdraw({
  step,
}: StepContentProps<ZapQuoteStepWithdraw>) {
  const { t } = useTranslation();
  const tokenAmounts = useTokenAmounts(step.outputs);

  return (
    <Trans
      t={t}
      i18nKey="Transact-Route-Step-Withdraw"
      components={{
        tokenAmounts: <ListJoin items={tokenAmounts} />,
      }}
    />
  );
});

const StepContentSplit = memo(function StepContentSplit({
  step,
}: StepContentProps<ZapQuoteStepSplit>) {
  const { t } = useTranslation();
  const provider = useAppSelector(state =>
    step.inputToken.providerId ? selectPlatformById(state, step.inputToken.providerId) : undefined
  );
  const tokenAmounts = useTokenAmounts(step.outputs);

  return (
    <>
      <Trans
        t={t}
        i18nKey="Transact-Route-Step-Split"
        values={{
          provider: provider ? provider.name : 'underlying platform',
        }}
        components={{
          tokenAmounts: <ListJoin items={tokenAmounts} />,
        }}
      />
    </>
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
};

type StepProps = {
  step: ZapQuoteStep;
  number: number;
};
const Step = memo(function Step({ step, number }: StepProps) {
  const classes = useStyles();
  const Component = StepContentComponents[step.type] as ComponentType<
    StepContentProps<ZapQuoteStep>
  >;

  return (
    <>
      <div className={classes.stepNumber}>{number}.</div>
      <div className={classes.stepContent}>
        <Component step={step} />
      </div>
    </>
  );
});

export type ZapRouteProps = {
  quote: ZapQuote;
  css?: CssStyles;
};
export const ZapRoute = memo(function ZapRoute({ quote, css: cssProp }: ZapRouteProps) {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const quotes = useAppSelector(selectTransactQuoteIds);
  const hasMultipleOptions = quotes.length > 1;
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
      <div className={classes.title}>{t('Transact-ZapRoute')}</div>
      <div className={classes.routeHolder}>
        <div
          className={css(styles.routeHeader, hasMultipleOptions && styles.routerHeaderClickable)}
          onClick={hasMultipleOptions ? handleSwitch : undefined}
        >
          <QuoteTitle quote={quote} />
          {hasMultipleOptions ? '>' : undefined}
        </div>
        <div className={classes.routeContent}>
          <div className={classes.steps}>
            {quote.steps.map((step, i) => (
              <Step step={step} key={i} number={i + 1} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
