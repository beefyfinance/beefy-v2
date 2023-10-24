import React, { memo } from 'react';
import { makeStyles } from '@material-ui/styles';
import { styles } from './styles';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

export type IntroductionProps = {
  className?: string;
};

export const Introduction = memo<IntroductionProps>(function Introduction({ className }) {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={clsx(classes.introduction, className)}>
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
