import { memo } from 'react';
import { styled } from '@repo/styles/jsx';
import { selectUserUnstakedClms } from '../../../features/data/selectors/balance.ts';
import { useAppSelector } from '../../../features/data/store/hooks.ts';
import { Container } from '../../Container/Container.tsx';
import type { UnstakedClmBannerDashboardProps } from './types.ts';
import { UnstakedClmBanner } from './UnstakedClmBanner.tsx';
import { selectWalletAddressIfKnown } from '../../../features/data/selectors/wallet.ts';

export const UnstakedClmBannerDashboard = memo<UnstakedClmBannerDashboardProps>(
  function UnstakedClmBannerDashboard({ address }) {
    const unstakedIds = useAppSelector(state => selectUserUnstakedClms(state, address));
    const walletAddress = useAppSelector(selectWalletAddressIfKnown);

    if (!unstakedIds.length || walletAddress?.toLocaleLowerCase() !== address.toLocaleLowerCase()) {
      return null;
    }

    return (
      <BannerWrapper>
        <BannerContainer maxWidth="lg">
          <UnstakedClmBanner />
        </BannerContainer>
      </BannerWrapper>
    );
  }
);

const BannerWrapper = styled('div', {
  base: {
    backgroundColor: 'background.header',
    paddingBottom: '24px',
  },
});

const BannerContainer = styled(Container, {
  base: {
    lg: {
      paddingInline: '26px',
    },
  },
});
