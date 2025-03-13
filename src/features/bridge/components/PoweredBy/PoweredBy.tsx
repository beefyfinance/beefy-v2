import { memo } from 'react';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { styles } from './styles.ts';
import { useTranslation } from 'react-i18next';
import logoAxelar from '../../../../images/bridge-providers/logos/axelar.svg';
import logoLayerZero from '../../../../images/bridge-providers/logos/layer-zero.svg';
import logoChainlink from '../../../../images/bridge-providers/logos/chainlink.svg';
import logoOptimism from '../../../../images/bridge-providers/logos/optimism.svg';
import logoConnext from '../../../../images/bridge-providers/logos/connext.svg';

const useStyles = legacyMakeStyles(styles);

export const PoweredBy = memo(function PoweredBy() {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div>
      <div className={classes.poweredByLabel}>{t('Bridge-Intro-PoweredBy')}</div>
      <div className={classes.poweredByLogos}>
        <img src={logoLayerZero} alt={'LayerZero'} style={{ height: '32px' }} />
        <img src={logoAxelar} alt={'Axelar'} style={{ height: '24px' }} />
        <img src={logoChainlink} alt={'Chainlink'} style={{ height: '32px' }} />
        <img src={logoOptimism} alt={'Optimism'} style={{ height: '24px' }} />
        <img src={logoConnext} alt={'Connext'} style={{ height: '24px' }} />
      </div>
    </div>
  );
});
