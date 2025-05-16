import { memo } from 'react';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { styles } from './styles.ts';
import { Debug } from './Debug.tsx';
import { useTranslation } from 'react-i18next';
import { PROVIDERS } from '../OnRamp/providers.tsx';
import { featureFlag_debugOnRamp } from '../../../data/utils/feature-flags.ts';
import { getOnRampProviderLogo } from '../../../../helpers/onrampProviderSrc.ts';

const useStyles = legacyMakeStyles(styles);

export const Introduction = memo(function Introduction() {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div>
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
            <img
              key={key}
              src={getOnRampProviderLogo(key)}
              alt={provider.title}
              style={{ height: '32px' }}
            />
          ))}
        </div>
      </div>
      {featureFlag_debugOnRamp() ?
        <Debug />
      : null}
    </div>
  );
});
