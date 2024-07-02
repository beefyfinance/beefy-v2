import { makeStyles } from '@material-ui/core';
import { Trans, useTranslation } from 'react-i18next';
import { styles } from './styles';
import React, { memo, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectTransactInputAmounts,
  selectTransactInputMaxes,
  selectTransactMode,
  selectTransactQuoteError,
  selectTransactQuoteStatus,
  selectTransactSelected,
  selectTransactSelectedChainId,
  selectTransactSelectedQuote,
  selectTransactSelectedSelectionId,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact';
import { BIG_ZERO } from '../../../../../../helpers/big-number';
import { transactFetchQuotesIfNeeded } from '../../../../../data/actions/transact';
import { transactActions } from '../../../../../data/reducers/wallet/transact';
import { TokenAmountIcon, TokenAmountIconLoader } from '../TokenAmountIcon/TokenAmountIcon';
import {
  type CowcentratedVaultDepositQuote,
  type CowcentratedZapDepositQuote,
  isCowcentratedDepositQuote,
  isCowcentratedVaultWithdrawQuote,
  isZapQuote,
} from '../../../../../data/apis/transact/transact-types';
import { ZapRoute } from '../ZapRoute';
import { QuoteTitleRefresh } from '../QuoteTitleRefresh';
import { AlertError, AlertInfo } from '../../../../../../components/Alerts';
import { TransactStatus } from '../../../../../data/reducers/wallet/transact-types';
import { ZapSlippage } from '../ZapSlippage';
import type BigNumber from 'bignumber.js';
import { debounce } from 'lodash-es';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { isCowcentratedVault } from '../../../../../data/entities/vault';
import { isTokenEqual } from '../../../../../data/entities/token';
import { formatTokenDisplayCondensed } from '../../../../../../helpers/format';

const useStyles = makeStyles(styles);

export type TransactQuoteProps = {
  title: string;
  className?: string;
};
export const TransactQuote = memo<TransactQuoteProps>(function TransactQuote({ title, className }) {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectTransactMode);
  const selectionId = useAppSelector(selectTransactSelectedSelectionId);
  const selection = useAppSelector(selectTransactSelected);
  const inputAmounts = useAppSelector(selectTransactInputAmounts);
  const inputMaxes = useAppSelector(selectTransactInputMaxes);
  const chainId = useAppSelector(selectTransactSelectedChainId);
  const status = useAppSelector(selectTransactQuoteStatus);
  const debouncedFetchQuotes = useMemo(
    () =>
      debounce(
        (dispatch: ReturnType<typeof useAppDispatch>, inputAmounts: BigNumber[]) => {
          if (inputAmounts.every(amount => amount.lte(BIG_ZERO))) {
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
    debouncedFetchQuotes(dispatch, inputAmounts);
  }, [dispatch, mode, chainId, selectionId, selection, inputAmounts, inputMaxes, debouncedFetchQuotes]);

  if (status === TransactStatus.Idle) {
    return <QuoteIdle title={title} className={className} />;
  }

  return (
    <div className={clsx(classes.container, className)}>
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

const QuoteIdle = memo<TransactQuoteProps>(function QuoteIdle({ title, className }) {
  const classes = useStyles();
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  return (
    <div className={clsx(classes.container, classes.disabled, className)}>
      <QuoteTitleRefresh title={title} enableRefresh={true} />
      <div className={classes.tokenAmounts}>
        {isCowcentratedVault(vault) ? (
          <div className={classes.amountsSideBySide}>
            {vault.depositTokenAddresses.map(tokenAddress => {
              return (
                <TokenAmountIcon
                  key={tokenAddress}
                  amount={BIG_ZERO}
                  chainId={vault.chainId}
                  tokenAddress={tokenAddress}
                  className={classes.fullWidth}
                />
              );
            })}
          </div>
        ) : (
          <TokenAmountIcon
            amount={BIG_ZERO}
            chainId={vault.chainId}
            tokenAddress={vault.depositTokenAddress}
          />
        )}
      </div>
    </div>
  );
});

const QuoteError = memo(function QuoteError() {
  const classes = useStyles();
  const { t } = useTranslation();
  const error = useAppSelector(selectTransactQuoteError);

  return error && error?.code === 'calm' ? (
    <AlertError>
      <p>
        <Trans
          t={t}
          i18nKey={'Transact-Quote-Error-Calm'}
          components={{
            LinkCalm: (
              <a
                className={classes.link}
                href={'https://docs.beefy.finance/beefy-products/clm#calmness-check'}
                target="_blank"
                rel="noopener"
              />
            ),
          }}
        />
      </p>
    </AlertError>
  ) : (
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
  const needsSlippage = isZap || isCowcentratedVaultWithdrawQuote(quote);

  return (
    <>
      <div className={classes.tokenAmounts}>
        {isCowcentratedDepositQuote(quote) ? (
          <CowcentratedLoadedQuote quote={quote} />
        ) : (
          <>
            {quote.outputs.map(({ token, amount }) => (
              <TokenAmountIcon
                key={token.address}
                amount={amount}
                chainId={token.chainId}
                tokenAddress={token.address}
              />
            ))}
          </>
        )}
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
      {isZap ? <ZapRoute quote={quote} className={classes.route} /> : null}
      {needsSlippage ? <ZapSlippage className={classes.slippage} /> : null}
    </>
  );
});

export const CowcentratedLoadedQuote = memo(function CowcentratedLoadedQuote({
  quote,
}: {
  quote: CowcentratedVaultDepositQuote | CowcentratedZapDepositQuote;
}) {
  const { t } = useTranslation();
  const shares = quote.outputs[0];
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const classes = useStyles();
  const singleSided = useMemo(() => {
    if (quote.used.length !== 2) {
      return false;
    }

    const noneUsed = quote.used.every(ta => ta.amount.isZero());
    if (noneUsed) {
      // handled by CowcentratedNoSingleSideAllowedNotice stopping the deposit
      return false;
    }

    const unusedIndex = quote.unused.findIndex(ta => !ta.amount.isZero());
    const unused = quote.unused[unusedIndex];
    const needed = quote.used[unusedIndex === 0 ? 1 : 0];
    if (!unused || !needed) {
      return false;
    }

    if (!isTokenEqual(needed.token, quote.toBalance.token)) {
      return false;
    }

    const moreNeeded = quote.toBalance.amount.minus(needed.amount);

    return {
      needed: needed.token,
      neededAmount: quote.toBalance.amount,
      neededMoreAmount: moreNeeded,
      unused: unused.token,
    };
  }, [quote.used, quote.unused, quote.toBalance]);

  return (
    <div className={classes.cowcentratedDepositContainer}>
      <div className={classes.amountsSideBySide}>
        {quote.used.map(used => {
          return (
            <TokenAmountIcon
              key={used.token.id}
              amount={used.amount}
              chainId={used.token.chainId}
              tokenAddress={used.token.address}
              showSymbol={false}
              className={classes.fullWidth}
              tokenImageSize={28}
              amountWithValueClassName={classes.alignItemsEnd}
            />
          );
        })}
      </div>
      {singleSided ? (
        <AlertInfo>
          {t('Transact-Notice-CowcentratedNeedsBalanced', {
            unused: singleSided.unused.symbol,
            needed: singleSided.needed.symbol,
            amount: formatTokenDisplayCondensed(
              singleSided.neededAmount,
              singleSided.needed.decimals
            ),
          })}
        </AlertInfo>
      ) : null}
      <div className={classes.label}>{t('Your Position Will Be')}</div>
      <div className={classes.cowcentratedSharesDepositContainer}>
        <TokenAmountIcon
          key={shares.token.id}
          amount={shares.amount}
          chainId={shares.token.chainId}
          tokenAddress={vault.depositTokenAddress}
          className={classes.mainLp}
        />
        <div className={classes.amountsSideBySide}>
          {quote.position.map((position, i) => {
            return (
              <TokenAmountIcon
                key={position.token.id}
                amount={position.amount}
                chainId={position.token.chainId}
                tokenAddress={position.token.address}
                className={clsx(classes.fullWidth, classes[`borderRadiusToken${i}`])}
                showSymbol={false}
                tokenImageSize={28}
                amountWithValueClassName={classes.alignItemsEnd}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
});
