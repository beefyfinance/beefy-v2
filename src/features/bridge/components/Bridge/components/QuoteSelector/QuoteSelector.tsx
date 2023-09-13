import React, { memo, ReactNode, useCallback, useMemo } from 'react';
import { makeStyles } from '@material-ui/core';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectBridgeFormState,
  selectBridgeIdsFromTo,
  selectBridgeQuoteById,
  selectBridgeQuoteIds,
  selectBridgeQuoteSelectedId,
  selectBridgeQuoteStatus,
} from '../../../../../data/selectors/bridge';
import { formatBigDecimals } from '../../../../../../helpers/format';
import { bridgeActions } from '../../../../../data/reducers/wallet/bridge';
import clsx from 'clsx';
import { getBridgeProviderIcon } from '../../../../../../helpers/bridgeProviderSrc';
import { Scrollable } from '../../../../../../components/Scrollable';
import { MonetizationOn, Timer } from '@material-ui/icons';
import { styles } from './styles';
import { TextLoader } from '../../../../../../components/TextLoader';
import type { BeefyAnyBridgeConfig } from '../../../../../data/apis/config-types';

const useStyles = makeStyles(styles);

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
  const providerIcon = useMemo(() => {
    return getBridgeProviderIcon(quoteId);
  }, [quoteId]);

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
        providerIcon={
          <img
            src={providerIcon}
            alt={quoteId}
            width={32}
            height={32}
            className={classes.quoteProviderIcon}
          />
        }
        fee={
          <>
            {formatBigDecimals(quote.fee.amount, 4)} {quote.fee.token.symbol}
          </>
        }
        time={<>~{quote.timeEstimate}m</>}
      />
    </button>
  );
});

type QuoteButtonInnerProps = {
  providerIcon: ReactNode;
  fee: ReactNode;
  time: ReactNode;
};
const QuoteButtonInner = memo<QuoteButtonInnerProps>(function QuoteButtonInner({
  providerIcon,
  fee,
  time,
}) {
  const classes = useStyles();

  return (
    <>
      <div className={classes.quoteProvider}>{providerIcon}</div>
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
  const providerIcon = useMemo(() => {
    return getBridgeProviderIcon(providerId);
  }, [providerId]);

  return (
    <div className={classes.quote}>
      <QuoteButtonInner
        providerIcon={
          <img
            src={providerIcon}
            alt={providerId}
            width={32}
            height={32}
            className={classes.quoteProviderIcon}
          />
        }
        fee={<TextLoader placeholder="0.0000 ETH" />}
        time={<TextLoader placeholder="~30m" />}
      />
    </div>
  );
});

const Quotes = memo(function Quotes() {
  const classes = useStyles();
  const ids = useAppSelector(selectBridgeQuoteIds);
  const selectedId = useAppSelector(selectBridgeQuoteSelectedId);

  return (
    <div className={classes.quotes}>
      {ids.map(id => (
        <QuoteButton quoteId={id} key={id} selected={selectedId === id} />
      ))}
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

const QuotesError = memo(function QuotesError() {
  return <div>rejected...</div>;
});

type QuoteSelectorProps = {
  className?: string;
};

export const QuoteSelector = memo<QuoteSelectorProps>(function QuoteSelector({ className }) {
  const classes = useStyles();
  const status = useAppSelector(selectBridgeQuoteStatus);
  console.log(status);

  if (status === 'idle') {
    return null;
  }

  return (
    <div className={clsx(classes.container, className)}>
      {status === 'rejected' ? (
        <QuotesError />
      ) : (
        <Scrollable
          className={classes.scrollable}
          thumbClassName={classes.scrollableThumb}
          topShadowClassName={classes.scrollableTopShadow}
          bottomShadowClassName={classes.scrollableBottomShadow}
          leftShadowClassName={classes.scrollableLeftShadow}
          rightShadowClassName={classes.scrollableRightShadow}
        >
          {status === 'fulfilled' ? <Quotes /> : <QuotesLoading />}
        </Scrollable>
      )}
    </div>
  );
});
