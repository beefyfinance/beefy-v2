import type { ComponentType, ReactNode } from 'react';
import React, { Fragment, memo, useCallback, useMemo } from 'react';
import type {
  TokenAmount,
  ZapQuote,
  ZapQuoteStep,
  ZapQuoteStepBuild,
  ZapQuoteStepDeposit,
  ZapQuoteStepSplit,
  ZapQuoteStepSwap,
  ZapQuoteStepUnused,
  ZapQuoteStepWithdraw,
} from '../../../../../data/apis/transact/transact-types';
import { Trans, useTranslation } from 'react-i18next';
import { TokenAmountFromEntity } from '../../../../../../components/TokenAmount';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { selectPlatformById } from '../../../../../data/selectors/platforms';
import { ListJoin } from '../../../../../../components/ListJoin';
import { selectTransactQuoteIds } from '../../../../../data/selectors/transact';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { QuoteTitle } from '../QuoteTitle';
import { transactActions } from '../../../../../data/reducers/wallet/transact';
import { TransactStep } from '../../../../../data/reducers/wallet/transact-types';
import { selectZapSwapProviderName } from '../../../../../data/selectors/zap';

const useStyles = makeStyles(styles);

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
  className?: string;
};

const StepContentSwap = memo<StepContentProps<ZapQuoteStepSwap>>(function StepContentSwap({
  step,
}) {
  const { t } = useTranslation();
  const { providerId, via } = step;
  const platformName = useAppSelector(state =>
    selectZapSwapProviderName(state, providerId, via, t)
  );
  const textKey =
    via === 'aggregator' && providerId === 'wnative'
      ? step.toToken.type === 'native'
        ? 'Transact-Route-Step-Unwrap'
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

const StepContentBuild = memo<StepContentProps<ZapQuoteStepBuild>>(function StepContentBuild({
  step,
}) {
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

const StepContentDeposit = memo<StepContentProps<ZapQuoteStepDeposit>>(function StepContentDeposit({
  step,
}) {
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

const StepContentWithdraw = memo<StepContentProps<ZapQuoteStepWithdraw>>(
  function StepContentWithdraw({ step }) {
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
  }
);

const StepContentSplit = memo<StepContentProps<ZapQuoteStepSplit>>(function StepContentSplit({
  step,
}) {
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

const StepContentUnused = memo<StepContentProps<ZapQuoteStepUnused>>(function StepContentUnused({
  step,
}) {
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

const StepContentComponents: Record<
  ZapQuoteStep['type'],
  ComponentType<StepContentProps<ZapQuoteStep>>
> = {
  swap: StepContentSwap,
  build: StepContentBuild,
  deposit: StepContentDeposit,
  withdraw: StepContentWithdraw,
  split: StepContentSplit,
  unused: StepContentUnused,
};

type StepProps = {
  step: ZapQuoteStep;
  number: number;
};
const Step = memo<StepProps>(function Step({ step, number }) {
  const classes = useStyles();
  const Component = StepContentComponents[step.type];

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
  className?: string;
};
export const ZapRoute = memo<ZapRouteProps>(function ZapRoute({ quote, className }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const quotes = useAppSelector(selectTransactQuoteIds);
  const hasMultipleOptions = quotes.length > 1;
  const handleSwitch = useCallback(() => {
    dispatch(transactActions.switchStep(TransactStep.QuoteSelect));
  }, [dispatch]);

  return (
    <div className={clsx(classes.holder, className)}>
      <div className={classes.title}>{t('Transact-ZapRoute')}</div>
      <div className={classes.routeHolder}>
        <div
          className={clsx(classes.routeHeader, {
            [classes.routerHeaderClickable]: hasMultipleOptions,
          })}
          onClick={hasMultipleOptions ? handleSwitch : undefined}
        >
          <QuoteTitle quote={quote} className={classes.routeHeaderProvider} />
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
