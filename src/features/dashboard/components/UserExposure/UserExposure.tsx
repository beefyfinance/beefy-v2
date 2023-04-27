import { Hidden, makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChainExposureLoader } from '../ChainExposure';
import { PlatformExposureLoader } from '../PlatformExposure';
import { Section } from '../../../../components/Section';
import { StablesExposure } from '../StablesExposure';
import { TokenExposureLoader } from '../TokenExposure';
import { styles } from './styles';
import { MobileUserExposure } from './components/MobileUserExposure';

const useStyles = makeStyles(styles);

export const UserExposure = memo(function UserExposure() {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Section title={t('Overview')}>
      <div className={classes.pieChartsContainer}>
        <Hidden smDown>
          <ChainExposureLoader title={t('Exposure-Chain')} />
          <PlatformExposureLoader title={t('Exposure-Platform')} />
          <TokenExposureLoader title={t('Exposure-Tokens')} />
        </Hidden>
        <Hidden mdUp>
          <MobileUserExposure />
        </Hidden>
        <Hidden lgUp>
          <StablesExposure />
        </Hidden>
      </div>
      <Hidden mdDown>
        <StablesExposure />
      </Hidden>
    </Section>
  );
});
