import { memo } from 'react';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { styles } from './styles.ts';
import { useTranslation } from 'react-i18next';
import logoAxelar from '../../../../images/bridge-providers/logos/axelar.svg';
import logoLayerZero from '../../../../images/bridge-providers/logos/layer-zero.svg';
import logoChainlink from '../../../../images/bridge-providers/logos/chainlink.svg';
import logoOptimism from '../../../../images/bridge-providers/logos/optimism.svg';
import logoConnext from '../../../../images/bridge-providers/logos/connext.svg';
import { css, type CssStyles } from '@repo/styles/css';

const useStyles = legacyMakeStyles(styles);

export type PoweredByProps = {
  css?: CssStyles;
};

export const PoweredBy = memo(function PoweredBy({ css: cssProp }: PoweredByProps) {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={css(styles.poweredBy, cssProp)}>
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
