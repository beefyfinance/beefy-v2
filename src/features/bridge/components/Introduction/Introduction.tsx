import React, { memo } from 'react';
import { makeStyles } from '@material-ui/styles';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../store';
import { selectAllChains } from '../../../data/selectors/chains';
import { Link } from 'react-router-dom';

const useStyles = makeStyles(styles);

export const Introduction = memo(function () {
  const classes = useStyles();
  const { t } = useTranslation();
  const chains = useAppSelector(selectAllChains);

  return (
    <div className={classes.container}>
      <h1 className={classes.title}>{t('Bridge-Intro-Title', { chains: chains.length })}</h1>
      <div className={classes.text}>
        {t('Bridge-Intro-Text')
          .split('\n')
          .map((text, i) => {
            return (
              <p key={i}>
                {text} {i === 1 && <Link to="/">{t('Bridge-Intro-Link')}</Link>}
              </p>
            );
          })}
      </div>
      <div className={classes.poweredBy}>
        <div className={classes.poweredByLabel}>{t('OnRamp-Intro-PoweredBy')}</div>
        <div className={classes.poweredByLogos}>
          <img
            src={require(`../../../../images/partners/multichain.png`).default}
            alt={'multichain'}
            height="32"
          />
        </div>
      </div>
    </div>
  );
});
