import React, { memo, type ReactNode, useCallback, useMemo } from 'react';
import { makeStyles } from '@material-ui/core';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectAllBridgeLimitedQuotes,
  selectBridgeConfigById,
  selectBridgeFormState,
  selectBridgeIdsFromTo,
  selectBridgeLimitedQuoteById,
  selectBridgeLimitedQuoteIds,
  selectBridgeQuoteById,
  selectBridgeQuoteErrorLimits,
  selectBridgeQuoteIds,
  selectBridgeQuoteSelectedId,
  selectBridgeQuoteStatus,
} from '../../../../../data/selectors/bridge';
import { formatBigDecimals, formatBigUsd } from '../../../../../../helpers/format';
import { bridgeActions } from '../../../../../data/reducers/wallet/bridge';
import clsx from 'clsx';
import { getBridgeProviderIcon } from '../../../../../../helpers/bridgeProviderSrc';
import { Lock, MonetizationOn, Timer } from '@material-ui/icons';
import { styles } from './styles';
import { TextLoader } from '../../../../../../components/TextLoader';
import type { BeefyAnyBridgeConfig } from '../../../../../data/apis/config-types';
import { AlertError } from '../../../../../../components/Alerts';
import { useTranslation } from 'react-i18next';
import { formatMinutesDuration } from '../../../../../../helpers/date';
import { selectTokenPriceByAddress } from '../../../../../data/selectors/tokens';
import BigNumber from 'bignumber.js';
import { BIG_ONE } from '../../../../../../helpers/big-number';

const useStyles = makeStyles(styles);

type QuoteLimitedProps = {
  quoteId: string;
  className?: string;
};

const QuoteLimited = memo<QuoteLimitedProps>(function QuoteLimited({ quoteId }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const quote = useAppSelector(state => selectBridgeLimitedQuoteById(state, quoteId));
  const providerId = quote.config.id;
  const config = useAppSelector(state => selectBridgeConfigById(state, providerId));
  const providerIcon = useMemo(() => {
    return getBridgeProviderIcon(providerId);
  }, [providerId]);
  const limit = useMemo(() => {
    return BigNumber.min(quote.limits.from.current, quote.limits.to.current);
  }, [quote.limits.from, quote.limits.to]);

  return (
    <div
      className={clsx({
        [classes.quote]: true,
        [classes.quoteLimited]: true,
      })}
    >
      <div className={classes.quoteProvider}>
        <img
          src={providerIcon}
          alt={providerId}
          width={24}
          height={24}
          className={classes.quoteProviderIcon}
        />
        <div className={classes.quoteProviderTitle}>{config.title}</div>
      </div>
      <div className={classes.quoteLimit}>
        <Lock className={classes.quoteLimitIcon} />
        <div>{t('Bridge-Quote-RateLimited', { amount: formatBigDecimals(limit, 4) })}</div>
      </div>
    </div>
  );
});

type QuoteButtonProps = {
  quoteId: string;
  selected: boolean;
  className?: string;
};

const QuoteButton = memo<QuoteButtonProps>(function QuoteButton({ quoteId, selected }) {
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const quote = useAppSelector(state => selectBridgeQuoteById(state, quoteId));
  const handleClick = useCallback(() => {
    if (selected) {
      dispatch(bridgeActions.unselectQuote());
    } else {
      dispatch(bridgeActions.selectQuote({ quoteId: quoteId }));
    }
  }, [quoteId, selected, dispatch]);
  const timeEstimate = useMemo(() => {
    return formatMinutesDuration(quote.timeEstimate);
  }, [quote.timeEstimate]);
  const tokenPrice = useAppSelector(state =>
    selectTokenPriceByAddress(state, quote.fee.token.chainId, quote.fee.token.address)
  );
  const usdFee = useMemo(() => {
    return formatBigUsd(quote.fee.amount.multipliedBy(tokenPrice));
  }, [tokenPrice, quote.fee.amount]);

  return (
    <button
      onClick={handleClick}
      className={clsx({
        [classes.quote]: true,
        [classes.quoteButton]: true,
        [classes.quoteButtonSelected]: selected,
      })}
    >
      <QuoteButtonInner
        providerId={quote.config.id}
        fee={
          <>
            ~{formatBigDecimals(quote.fee.amount, 4)} {quote.fee.token.symbol} ({usdFee})
          </>
        }
        time={<>~{timeEstimate}</>}
      />
    </button>
  );
});

type QuoteButtonInnerProps = {
  providerId: BeefyAnyBridgeConfig['id'];
  fee: ReactNode;
  time: ReactNode;
};
const QuoteButtonInner = memo<QuoteButtonInnerProps>(function QuoteButtonInner({
  providerId,
  fee,
  time,
}) {
  const classes = useStyles();
  const config = useAppSelector(state => selectBridgeConfigById(state, providerId));
  const providerIcon = useMemo(() => {
    return getBridgeProviderIcon(providerId);
  }, [providerId]);

  return (
    <>
      <div className={classes.quoteProvider}>
        <img
          src={providerIcon}
          alt={providerId}
          width={24}
          height={24}
          className={classes.quoteProviderIcon}
        />
        <div className={classes.quoteProviderTitle}>{config.title}</div>
      </div>
      <div className={classes.quoteFee}>
        <MonetizationOn className={classes.quoteFeeIcon} />
        <div> {fee} </div>
      </div>
      <div className={classes.quoteTime}>
        <Timer className={classes.quoteTimeIcon} />
        <div>{time}</div>
      </div>
    </>
  );
});

type LoadingQuoteButtonProps = {
  providerId: BeefyAnyBridgeConfig['id'];
};
const LoadingQuoteButton = memo<LoadingQuoteButtonProps>(function LoadingQuoteButton({
  providerId,
}) {
  const classes = useStyles();

  return (
    <div className={classes.quote}>
      <QuoteButtonInner
        providerId={providerId}
        fee={<TextLoader placeholder="0.0000 ETH" />}
        time={<TextLoader placeholder="~30m" />}
      />
    </div>
  );
});

const Quotes = memo(function Quotes() {
  const classes = useStyles();
  const ids = useAppSelector(selectBridgeQuoteIds);
  const limitedIds = useAppSelector(selectBridgeLimitedQuoteIds);
  const selectedId = useAppSelector(selectBridgeQuoteSelectedId);

  return (
    <div className={classes.quotes}>
      <>
        {ids.map(id => (
          <QuoteButton quoteId={id} key={id} selected={selectedId === id} />
        ))}
        {limitedIds.map(id => (
          <QuoteLimited quoteId={id} key={id} />
        ))}
      </>
    </div>
  );
});

const QuotesLoading = memo(function QuotesLoading() {
  const classes = useStyles();
  const { from, to } = useAppSelector(selectBridgeFormState);
  const bridgeIds = useAppSelector(state => selectBridgeIdsFromTo(state, from, to));

  return (
    <div className={classes.quotes}>
      {bridgeIds.map(id => (
        <LoadingQuoteButton key={id} providerId={id} />
      ))}
    </div>
  );
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AllLimitedError = memo(function AllLimitedError() {
  const { t } = useTranslation();
  const quotes = useAppSelector(selectAllBridgeLimitedQuotes);
  const currentLimit = useMemo(() => {
    return BigNumber.max(
      ...quotes.map(quote => BigNumber.min(quote.limits.from.current, quote.limits.to.current))
    );
  }, [quotes]);
  const maxLimit = useMemo(() => {
    return BigNumber.max(
      ...quotes.map(quote => BigNumber.min(quote.limits.from.max, quote.limits.to.max))
    );
  }, [quotes]);
  const waitLimits = useMemo(() => {
    const wanted = quotes[0].input.amount;
    return maxLimit.minus(currentLimit).gt(BIG_ONE) && maxLimit.gt(wanted);
  }, [currentLimit, maxLimit, quotes]);

  return (
    <AlertError>
      {t(waitLimits ? 'Bridge-Quotes-AllRateLimited-Wait' : 'Bridge-Quotes-AllRateLimited', {
        current: formatBigDecimals(currentLimit, 4),
        max: formatBigDecimals(maxLimit, 4),
      })}
    </AlertError>
  );
});

const QuotesError = memo(function QuotesError() {
  const { t } = useTranslation();
  const errorLimits = useAppSelector(selectBridgeQuoteErrorLimits);

  // Special error if all quotes were rate limited
  if (errorLimits) {
    return (
      <AlertError>
        {t(
          errorLimits.canWait
            ? 'Bridge-Quotes-AllRateLimited-Wait'
            : 'Bridge-Quotes-AllRateLimited',
          {
            current: formatBigDecimals(errorLimits.current, 4),
            max: formatBigDecimals(errorLimits.max, 4),
          }
        )}
      </AlertError>
    );
  }

  return <AlertError>{t('Bridge-Quotes-Error')}</AlertError>;
});

type QuotesHolderProps = {
  status: 'fulfilled' | 'pending';
};

const QuotesHolder = memo<QuotesHolderProps>(function QuotesHolder({ status }) {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={classes.quotesHolder}>
      <div className={classes.quotesTitle}>{t('Bridge-Quotes-Title')}</div>
      {status === 'fulfilled' ? <Quotes /> : <QuotesLoading />}
    </div>
  );
});

type QuoteSelectorProps = {
  className?: string;
};

export const QuoteSelector = memo<QuoteSelectorProps>(function QuoteSelector({ className }) {
  const classes = useStyles();
  const status = useAppSelector(selectBridgeQuoteStatus);

  if (status === 'idle') {
    return null;
  }

  return (
    <div className={clsx(classes.container, className)}>
      {status === 'rejected' ? <QuotesError /> : <QuotesHolder status={status} />}
    </div>
  );
});
