import { memo, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const DefaultMeta = memo(function () {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const canonical = useMemo(() => {
    return `https://app.beefy.com${location.pathname}`;
  }, [location]);

  // @dev defaults should also be added to index.html with data-rh="true"
  return (
    <Helmet>
      <html lang={i18n.language} />
      <title>{t('Meta-Default-Title')}</title>
      <link rel="canonical" href={canonical} />
      <meta name="description" content={t('Meta-Default-Description')} />
      <meta property="og:title" content={t('Meta-Default-Title')} />
      <meta property="og:type" content="website" />
      <meta property="og:description" content={t('Meta-Default-Description')} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content="https://app.beefy.com/assets/meta/social20220521.png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:site" content="@beefyfinance" />
      <meta property="twitter:creator" content="@beefyfinance" />
      <meta property="twitter:title" content={t('Meta-Default-Title')} />
      <meta property="twitter:description" content={t('Meta-Default-Description')} />
      <meta
        property="twitter:image"
        content="https://app.beefy.com/assets/meta/social20220521.png"
      />
    </Helmet>
  );
});
