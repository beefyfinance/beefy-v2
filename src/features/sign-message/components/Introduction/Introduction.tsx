import { memo } from 'react';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { styles } from './styles.ts';
import { useTranslation } from 'react-i18next';
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
      <h1 className={classes.title}>{t('SignMessage-Title')}</h1>
      <div className={classes.text}>{t('SignMessage-Page-Intro')}</div>
      <div className={classes.disclaimer}>{t('SignMessage-Page-Disclaimer')}</div>
    </div>
  );
});
