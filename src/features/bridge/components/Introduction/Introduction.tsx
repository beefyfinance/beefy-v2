import React, { memo } from 'react';
import { makeStyles } from '@material-ui/styles';
import { styles } from './styles';
import { Trans, useTranslation } from 'react-i18next';
import logoAxelar from '../../../../images/bridge-providers/logos/axelar.svg';
import logoLayerZero from '../../../../images/bridge-providers/logos/layer-zero.svg';
import logoChainlink from '../../../../images/bridge-providers/logos/chainlink.svg';
import logoOptimism from '../../../../images/bridge-providers/logos/optimism.svg';
import { Link } from 'react-router-dom';

const useStyles = makeStyles(styles);

export const Introduction = memo(function Introduction() {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={classes.container}>
      <h1 className={classes.title}>{t('Bridge-Intro-Title')}</h1>
      <div className={classes.text}>
        <Trans
          i18nKey="Bridge-Intro-Text"
          t={t}
          components={{
            MaxiLink: <Link to={'/vault/bifi-maxi-todo'} className={classes.link} />,
          }}
        />
      </div>
      <div className={classes.poweredBy}>
        <div className={classes.poweredByLabel}>{t('Bridge-Intro-PoweredBy')}</div>
        <div className={classes.poweredByLogos}>
          <img src={logoLayerZero} alt={'LayerZero'} height="32" />
          <img src={logoAxelar} alt={'Axelar'} height="24" />
          <img src={logoChainlink} alt={'Chainlink'} height="32" />
          <img src={logoOptimism} alt={'Optimism'} height="24" />
        </div>
      </div>
    </div>
  );
});
