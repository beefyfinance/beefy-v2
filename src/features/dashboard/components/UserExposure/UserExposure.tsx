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

export type UserExposureProps = {
  address: string;
};

export const UserExposure = memo<UserExposureProps>(function UserExposure({ address }) {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Section title={t('Overview')}>
      <div className={classes.pieChartsContainer}>
        <Hidden smDown>
          <ChainExposureLoader address={address} title={t('Exposure-Chain')} />
          <PlatformExposureLoader address={address} title={t('Exposure-Platform')} />
          <TokenExposureLoader address={address} title={t('Exposure-Tokens')} />
        </Hidden>
        <Hidden mdUp>
          <MobileUserExposure address={address} />
        </Hidden>
        <Hidden lgUp>
          <StablesExposure address={address} />
        </Hidden>
      </div>
      <Hidden mdDown>
        <StablesExposure address={address} />
      </Hidden>
    </Section>
  );
});
