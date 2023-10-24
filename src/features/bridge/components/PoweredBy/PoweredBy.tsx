import React, { memo } from 'react';
import { makeStyles } from '@material-ui/styles';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import logoAxelar from '../../../../images/bridge-providers/logos/axelar.svg';
import logoLayerZero from '../../../../images/bridge-providers/logos/layer-zero.svg';
import logoChainlink from '../../../../images/bridge-providers/logos/chainlink.svg';
import logoOptimism from '../../../../images/bridge-providers/logos/optimism.svg';
import logoConnext from '../../../../images/bridge-providers/logos/connext.svg';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

export type PoweredByProps = {
  className?: string;
};

export const PoweredBy = memo<PoweredByProps>(function PoweredBy({ className }) {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={clsx(classes.poweredBy, className)}>
      <div className={classes.poweredByLabel}>{t('Bridge-Intro-PoweredBy')}</div>
      <div className={classes.poweredByLogos}>
        <img src={logoLayerZero} alt={'LayerZero'} height="32" />
        <img src={logoAxelar} alt={'Axelar'} height="24" />
        <img src={logoChainlink} alt={'Chainlink'} height="32" />
        <img src={logoOptimism} alt={'Optimism'} height="24" />
        <img src={logoConnext} alt={'Connext'} height="24" />
      </div>
    </div>
  );
});
