import { css, type CssStyles } from '@repo/styles/css';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import type { TransactQuote, ZapQuote } from '../../../../../data/apis/transact/transact-types.ts';
import { isZapQuote } from '../../../../../data/apis/transact/transact-types.ts';
import {
  selectZapQuoteProviders,
  selectZapQuoteTitle,
  type ZapQuoteProvider,
} from '../../../../../data/selectors/zap.ts';
import { ProviderIcon } from '../ProviderIcon/ProviderIcon.tsx';
import { styles } from './styles.ts';

export type QuoteTitleProps = {
  quote: TransactQuote;
  css?: CssStyles;
};
export const QuoteTitle = memo(function QuoteTitle({ quote, css: cssProp }: QuoteTitleProps) {
  const { t } = useTranslation();

  if (isZapQuote(quote)) {
    return <ZapQuoteTitle quote={quote} css={cssProp} />;
  }

  return <div className={css(styles.container, cssProp)}>{t('Transact-QuoteTitle')}</div>;
});

export type ZapQuoteTitleProps = {
  quote: ZapQuote;
  css?: CssStyles;
};
export const ZapQuoteTitle = memo(function ZapQuoteTitle({
  quote,
  css: cssProp,
}: ZapQuoteTitleProps) {
  const { t } = useTranslation();
  const providers: ZapQuoteProvider[] = useAppSelector(state =>
    selectZapQuoteProviders(state, quote.steps, t)
  );
  const { title, icon } = useAppSelector(state => selectZapQuoteTitle(state, quote.steps, t));

  if (providers.length <= 1) {
    return (
      <div className={css(styles.container, cssProp)}>
        <ProviderIcon provider={icon} width={24} css={styles.icon} />
        {t(title)}
      </div>
    );
  }

  return (
    <div className={css(styles.providersContainer, cssProp)}>
      {providers.map(provider => (
        <div key={provider.icon} className={css(styles.providerPill)}>
          {provider.name}
          <ProviderIcon provider={provider.icon} width={20} css={styles.providerIcon} />
        </div>
      ))}
    </div>
  );
});
