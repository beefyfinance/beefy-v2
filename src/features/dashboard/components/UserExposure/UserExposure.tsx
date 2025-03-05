import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChainExposureLoader } from '../ChainExposure/ChainExposure.tsx';
import { PlatformExposureLoader } from '../PlatformExposure/PlatformExposure.tsx';
import { Section } from '../../../../components/Section/Section.tsx';
import { StablesExposure } from '../StablesExposure/StablesExposure.tsx';
import { TokenExposureLoader } from '../TokenExposure/TokenExposure.tsx';
import { styles } from './styles.ts';
import { MobileUserExposure } from './components/MobileUserExposure/MobileUserExposure.tsx';
import { Hidden } from '../../../../components/MediaQueries/Hidden.tsx';

const useStyles = legacyMakeStyles(styles);

export type UserExposureProps = {
  address: string;
};

export const UserExposure = memo(function UserExposure({ address }: UserExposureProps) {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Section title={t('Overview')}>
      <div className={classes.pieChartsContainer}>
        <Hidden to="sm">
          <ChainExposureLoader address={address} title={t('Exposure-Chain')} />
          <PlatformExposureLoader address={address} title={t('Exposure-Platform')} />
          <TokenExposureLoader address={address} title={t('Exposure-Tokens')} />
        </Hidden>
        <Hidden from="md">
          <MobileUserExposure address={address} />
        </Hidden>
        <Hidden from="lg">
          <StablesExposure address={address} />
        </Hidden>
      </div>
      <Hidden to="md">
        <StablesExposure address={address} />
      </Hidden>
    </Section>
  );
});
