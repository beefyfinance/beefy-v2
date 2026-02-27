import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChainExposureLoader } from '../ChainExposure/ChainExposure.tsx';
import { PlatformExposureLoader } from '../PlatformExposure/PlatformExposure.tsx';
import { Section } from '../../../../components/Section/Section.tsx';
import { StablesExposure } from '../StablesExposure/StablesExposure.tsx';
import { TokenExposureLoader } from '../TokenExposure/TokenExposure.tsx';
import { MobileUserExposure } from './components/MobileUserExposure/MobileUserExposure.tsx';
import { Hidden } from '../../../../components/MediaQueries/Hidden.tsx';
import { styled } from '@repo/styles/jsx';

export type UserExposureProps = {
  address: string;
};

export const UserExposure = memo(function UserExposure({ address }: UserExposureProps) {
  const { t } = useTranslation();

  return (
    <Section title={t('Overview')}>
      <ChartsContainer>
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
      </ChartsContainer>
      <Hidden to="md">
        <StablesExposure address={address} />
      </Hidden>
    </Section>
  );
});

const ChartsContainer = styled('div', {
  base: {
    marginBottom: '24px',
    display: 'grid',
    gridTemplateColumns: 'repeat(3,1fr)',
    columnGap: '24px',
    rowGap: '24px',
    lgDown: {
      gridTemplateColumns: 'repeat(2,1fr)',
    },
    mdDown: {
      gridTemplateColumns: '1fr',
    },
  },
});
