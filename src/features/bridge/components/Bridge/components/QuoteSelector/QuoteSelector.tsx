import { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectBridgeQuoteById,
  selectBridgeQuoteIds,
  selectBridgeQuoteSelectedId,
  selectBridgeQuoteStatus,
} from '../../../../../data/selectors/bridge';
import { formatBigDecimals } from '../../../../../../helpers/format';
import { bridgeActions } from '../../../../../data/reducers/wallet/bridge';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

const PendingQuoteSelector = memo(function PendingQuoteSelector() {
  return <div>pending...</div>;
});

const RejectedQuoteSelector = memo(function RejectedQuoteSelector() {
  return <div>rejected...</div>;
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

  return (
    <button
      onClick={handleClick}
      className={clsx({ [classes.quoteButton]: true, [classes.quoteButtonSelected]: selected })}
    >
      <div>
        output: {formatBigDecimals(quote.output.amount, quote.output.token.decimals)}{' '}
        {quote.output.token.symbol}
      </div>
      <div>
        fee: {formatBigDecimals(quote.fee.amount, quote.fee.token.decimals)}{' '}
        {quote.fee.token.symbol}
      </div>
      <div>via: {quoteId}</div>
    </button>
  );
});

const FulfilledQuoteSelector = memo(function FulfilledQuoteSelector() {
  const ids = useAppSelector(selectBridgeQuoteIds);
  const selectedId = useAppSelector(selectBridgeQuoteSelectedId);

  return (
    <div>
      {ids.map(id => (
        <QuoteButton quoteId={id} key={id} selected={selectedId === id} />
      ))}
    </div>
  );
});

type QuoteSelectorProps = {
  className?: string;
};

export const QuoteSelector = memo<QuoteSelectorProps>(function QuoteSelector({ className }) {
  const status = useAppSelector(selectBridgeQuoteStatus);

  if (status === 'idle') {
    return null;
  }

  return (
    <div className={className}>
      {status === 'pending' ? (
        <PendingQuoteSelector />
      ) : status === 'rejected' ? (
        <RejectedQuoteSelector />
      ) : (
        <FulfilledQuoteSelector />
      )}
    </div>
  );
});
