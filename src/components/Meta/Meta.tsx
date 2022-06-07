import { memo, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { routerMode } from '../Router';
import { useTranslation } from 'react-i18next';

export type MetaProps = {
  title?: string;
  description?: string;
  noindex?: boolean;
  disableTitleTemplate?: boolean;
};
export const Meta = memo<MetaProps>(function Meta({
  title,
  description,
  noindex,
  disableTitleTemplate = false,
}) {
  const { t } = useTranslation();
  const fullTitle = useMemo(() => {
    return title && !disableTitleTemplate ? t('Meta-Title-Template', { title }) : title;
  }, [t, title, disableTitleTemplate]);

  return (
    <Helmet>
      {fullTitle ? <title>{fullTitle}</title> : null}
      {fullTitle ? <meta property="og:title" content={fullTitle} /> : null}
      {fullTitle ? <meta property="twitter:title" content={fullTitle} /> : null}
      {description ? <meta name="description" content={description} /> : null}
      {description ? <meta property="og:description" content={description} /> : null}
      {description ? <meta property="twitter:description" content={description} /> : null}
      {/* do not accidentally noindex entire domain when using hash router */}
      {noindex && routerMode === 'browser' ? <meta name="robots" content="noindex" /> : null}
    </Helmet>
  );
});
