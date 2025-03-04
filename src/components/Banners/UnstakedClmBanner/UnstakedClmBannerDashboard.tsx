import { memo } from 'react';
import type { UnstakedClmBannerDashboardProps } from './types.ts';
import { useAppSelector } from '../../../store.ts';
import { selectUserUnstakedClms } from '../../../features/data/selectors/balance.ts';
import { Container } from '../../Container/Container.tsx';
import { UnstakedClmBanner } from './UnstakedClmBanner.tsx';
import { css } from '@repo/styles/css';

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
