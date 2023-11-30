import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import type { TransactQuote, ZapQuote } from '../../../../../data/apis/transact/transact-types';
import { isZapQuote } from '../../../../../data/apis/transact/transact-types';
import { selectZapQuoteTitle } from '../../../../../data/selectors/zap';
import { useAppSelector } from '../../../../../../store';
import { ProviderIcon } from '../ProviderIcon';

const useStyles = makeStyles(styles);

export type QuoteTitleProps = {
  quote: TransactQuote;
  className?: string;
};
export const QuoteTitle = memo<QuoteTitleProps>(function QuoteTitle({ quote, className }) {
  const classes = useStyles();
  const { t } = useTranslation();

  if (isZapQuote(quote)) {
    return <ZapQuoteTitle quote={quote} className={className} />;
  }

  return <div className={clsx(classes.container, className)}>{t('Transact-QuoteTitle')}</div>;
});

export type ZapQuoteTitleProps = {
  quote: ZapQuote;
  className?: string;
};
export const ZapQuoteTitle = memo<ZapQuoteTitleProps>(function ZapQuoteTitle({ quote, className }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const { title, icon } = useAppSelector(state => selectZapQuoteTitle(state, quote.steps, t));

  return (
    <div className={clsx(classes.container, className)}>
      <ProviderIcon provider={icon} width={24} className={classes.icon} />
      {t(title)}
    </div>
  );
});
