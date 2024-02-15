import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { styles } from './styles';
import React, { memo, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectTransactInputAmount,
  selectTransactInputMax,
  selectTransactMode,
  selectTransactQuoteError,
  selectTransactQuoteStatus,
  selectTransactSelectedChainId,
  selectTransactSelectedQuote,
  selectTransactSelectedSelectionId,
} from '../../../../../data/selectors/transact';
import { BIG_ZERO } from '../../../../../../helpers/big-number';
import { transactFetchQuotesIfNeeded } from '../../../../../data/actions/transact';
import { transactActions } from '../../../../../data/reducers/wallet/transact';
import { TokenAmountIcon, TokenAmountIconLoader } from '../TokenAmountIcon/TokenAmountIcon';
import { QuoteArrowDivider } from '../QuoteArrowDivider';
import { isZapQuote } from '../../../../../data/apis/transact/transact-types';
import { ZapRoute } from '../ZapRoute';
import { QuoteTitleRefresh } from '../QuoteTitleRefresh';
import { AlertError } from '../../../../../../components/Alerts';
import { TransactStatus } from '../../../../../data/reducers/wallet/transact-types';
import { ZapSlippage } from '../ZapSlippage';
import type BigNumber from 'bignumber.js';
import { debounce } from 'lodash-es';

const useStyles = makeStyles(styles);

export type TransactQuoteProps = {
  title: string;
  className?: string;
};
export const TransactQuote = memo<TransactQuoteProps>(function TransactQuote({ title, className }) {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectTransactMode);
  const inputAmount = useAppSelector(selectTransactInputAmount);
  const inputMax = useAppSelector(selectTransactInputMax);
  const chainId = useAppSelector(selectTransactSelectedChainId);
  const selectionId = useAppSelector(selectTransactSelectedSelectionId);
  const status = useAppSelector(selectTransactQuoteStatus);
  const debouncedFetchQuotes = useMemo(
    () =>
      debounce(
        (dispatch: ReturnType<typeof useAppDispatch>, inputAmount: BigNumber) => {
          if (inputAmount.lte(BIG_ZERO)) {
            dispatch(transactActions.clearQuotes());
          } else {
            dispatch(transactFetchQuotesIfNeeded());
          }
        },
        200,
        { leading: false, trailing: true, maxWait: 1000 }
      ),
    []
  );

  useEffect(() => {
    debouncedFetchQuotes(dispatch, inputAmount);
  }, [dispatch, mode, chainId, selectionId, inputAmount, inputMax, debouncedFetchQuotes]);

  if (status === TransactStatus.Idle) {
    return null;
  }

  return (
    <div className={clsx(classes.container, className)}>
      <QuoteArrowDivider className={classes.divider} />
      <QuoteTitleRefresh
        title={title}
        enableRefresh={status === TransactStatus.Fulfilled || status === TransactStatus.Rejected}
      />
      {status === TransactStatus.Pending ? <QuoteLoading /> : null}
      {status === TransactStatus.Fulfilled ? <QuoteLoaded /> : null}
      {status === TransactStatus.Rejected ? <QuoteError /> : null}
    </div>
  );
});

const QuoteError = memo(function QuoteError() {
  const { t } = useTranslation();
  const error = useAppSelector(selectTransactQuoteError);

  return (
    <AlertError>
      <p>{t('Transact-Quote-Error')}</p>
      {error && error.message ? <p>{error.message}</p> : null}
    </AlertError>
  );
});

const QuoteLoading = memo(function QuoteLoading() {
  return <TokenAmountIconLoader />;
});

const QuoteLoaded = memo(function QuoteLoaded() {
  // const { t } = useTranslation();
  const classes = useStyles();
  const quote = useAppSelector(selectTransactSelectedQuote);
  const isZap = isZapQuote(quote);

  return (
    <>
      <div className={classes.tokenAmounts}>
        {quote.outputs.map(({ token, amount }) => (
          <TokenAmountIcon
            key={token.address}
            amount={amount}
            chainId={token.chainId}
            tokenAddress={token.address}
          />
        ))}
      </div>
      {/*      {quote.returned.length ? (
        <div className={classes.returned}>
          <div className={classes.returnedTitle}>{t('Transact-Returned')}</div>
          <div className={classes.tokenAmounts}>
            {quote.returned.map(({ token, amount }) => (
              <TokenAmountIcon
                key={token.address}
                amount={amount}
                chainId={token.chainId}
                tokenAddress={token.address}
              />
            ))}
          </div>
        </div>
      ) : null}*/}
      {isZap ? (
        <>
          <ZapRoute quote={quote} className={classes.route} />
          <ZapSlippage className={classes.slippage} />
        </>
      ) : null}
    </>
  );
});
