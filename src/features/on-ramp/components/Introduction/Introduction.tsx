import { memo } from 'react';
import { makeStyles } from '@material-ui/styles';
import { styles } from './styles';
import { Debug } from './Debug';
import { useTranslation } from 'react-i18next';
import { PROVIDERS } from '../OnRamp/providers';
import { featureFlag_debugOnRamp } from '../../../data/utils/feature-flags';
import { getOnRampProviderLogo } from '../../../../helpers/onrampProviderSrc';

const useStyles = makeStyles(styles);

export const Introduction = memo(function Introduction() {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={classes.container}>
      <h1 className={classes.title}>{t('OnRamp-Intro-Title')}</h1>
      <div className={classes.text}>
        {t('OnRamp-Intro-Text')
          .split('\n')
          .map((text, i) => (
            <p key={i}>{text}</p>
          ))}
      </div>
      <div className={classes.poweredBy}>
        <div className={classes.poweredByLabel}>{t('OnRamp-Intro-PoweredBy')}</div>
        <div className={classes.poweredByLogos}>
          {Object.entries(PROVIDERS).map(([key, provider]) => (
            <img key={key} src={getOnRampProviderLogo(key)} alt={provider.title} height="32" />
          ))}
        </div>
      </div>
      {featureFlag_debugOnRamp() ? <Debug /> : null}
    </div>
  );
});
