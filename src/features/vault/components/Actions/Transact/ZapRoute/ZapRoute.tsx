import type { ComponentType } from 'react';
import React, { Fragment, memo, useCallback, useMemo } from 'react';
import type {
  ZapQuote,
  ZapQuoteStep,
  ZapQuoteStepBuild,
  ZapQuoteStepDeposit,
  ZapQuoteStepSplit,
  ZapQuoteStepSwap,
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
        fromAmount: (
          <TokenAmountFromEntity
            amount={step.fromAmount}
            token={step.fromToken}
            minShortPlaces={4}
          />
        ),
        toAmount: (
          <TokenAmountFromEntity amount={step.toAmount} token={step.toToken} minShortPlaces={4} />
        ),
      }}
    />
  );
});

const StepContentBuild = memo<StepContentProps<ZapQuoteStepBuild>>(function StepContentBuild({
  step,
}) {
  const { t } = useTranslation();
  const provider = useAppSelector(state => selectPlatformById(state, step.outputToken.providerId));
  const tokenAmounts = useMemo(() => {
    return step.inputs.map(tokenAmount => (
      <Fragment key={`${tokenAmount.token.chainId}-${tokenAmount.token.address}`}>
        <TokenAmountFromEntity
          amount={tokenAmount.amount}
          token={tokenAmount.token}
          minShortPlaces={4}
        />{' '}
        {tokenAmount.token.symbol}
      </Fragment>
    ));
  }, [step]);

  return (
    <>
      <Trans
        t={t}
        i18nKey="Transact-Route-Step-Build"
        values={{
          provider: provider.name,
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
  return (
    <Trans
      t={t}
      i18nKey="Transact-Route-Step-Deposit"
      values={{
        token: step.token.symbol,
      }}
      components={{
        amount: (
          <TokenAmountFromEntity amount={step.amount} token={step.token} minShortPlaces={4} />
        ),
      }}
    />
  );
});

const StepContentWithdraw = memo<StepContentProps<ZapQuoteStepWithdraw>>(
  function StepContentWithdraw({ step }) {
    const { t } = useTranslation();
    return (
      <Trans
        t={t}
        i18nKey="Transact-Route-Step-Withdraw"
        values={{
          token: step.token.symbol,
        }}
        components={{
          amount: (
            <TokenAmountFromEntity amount={step.amount} token={step.token} minShortPlaces={4} />
          ),
        }}
      />
    );
  }
);

const StepContentSplit = memo<StepContentProps<ZapQuoteStepSplit>>(function StepContentSplit({
  step,
}) {
  const { t } = useTranslation();
  const provider = useAppSelector(state => selectPlatformById(state, step.inputToken.providerId));
  const tokenAmounts = useMemo(() => {
    return step.outputs.map(tokenAmount => (
      <Fragment key={`${tokenAmount.token.chainId}-${tokenAmount.token.address}`}>
        <TokenAmountFromEntity
          amount={tokenAmount.amount}
          token={tokenAmount.token}
          minShortPlaces={4}
        />{' '}
        {tokenAmount.token.symbol}
      </Fragment>
    ));
  }, [step]);

  return (
    <>
      <Trans
        t={t}
        i18nKey="Transact-Route-Step-Split"
        values={{
          provider: provider.name,
        }}
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
