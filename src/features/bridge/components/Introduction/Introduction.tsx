import { memo } from 'react';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { styles } from './styles.ts';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { css, type CssStyles } from '@repo/styles/css';

const useStyles = legacyMakeStyles(styles);

export type IntroductionProps = {
  css?: CssStyles;
};

export const Introduction = memo(function Introduction({ css: cssProp }: IntroductionProps) {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={css(cssProp)}>
      <h1 className={classes.title}>{t('Bridge-Intro-Title')}</h1>
      <div className={classes.text}>
        <Trans
          i18nKey="Bridge-Intro-Text"
          t={t}
          components={{
            MaxiLink: <Link to={'/vault/bifi-vault'} className={classes.link} />,
          }}
        />
      </div>
    </div>
  );
});
