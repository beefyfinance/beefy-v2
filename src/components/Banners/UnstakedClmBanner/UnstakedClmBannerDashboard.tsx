import { css } from '@repo/styles/css';
import { memo } from 'react';
import { selectUserUnstakedClms } from '../../../features/data/selectors/balance.ts';
import { useAppSelector } from '../../../features/data/store/hooks.ts';
import { Container } from '../../Container/Container.tsx';
import type { UnstakedClmBannerDashboardProps } from './types.ts';
import { UnstakedClmBanner } from './UnstakedClmBanner.tsx';

export const UnstakedClmBannerDashboard = memo<UnstakedClmBannerDashboardProps>(
  function UnstakedClmBannerDashboard({ address }) {
    const unstakedIds = useAppSelector(state => selectUserUnstakedClms(state, address));

    if (!unstakedIds.length) {
      return null;
    }

    return (
      <div className={css({ backgroundColor: 'background.header' })}>
        <Container maxWidth="lg">
          <UnstakedClmBanner />
        </Container>
      </div>
    );
  }
);
