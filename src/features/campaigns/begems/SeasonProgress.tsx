import { memo, useMemo } from 'react';
import { getUnixNow } from '../../../helpers/date.ts';
import { useAppSelector } from '../../data/store/hooks.ts';
import { selectBeGemsSeasons } from '../../data/selectors/campaigns/begems.ts';
import { ProgressBar } from './components/ProgressBar.tsx';
import { styled } from '@repo/styles/jsx';

export const SeasonProgressBar = memo(function SeasonProgressBar() {
  const seasons = useAppSelector(selectBeGemsSeasons);
  const { progress } = useMemo(() => {
    const firstStart = Math.min(...seasons.map(season => season.startTime));
    const lastEnd = Math.max(...seasons.map(season => season.endTime));
    const now = getUnixNow();
    const progress = ((now - firstStart) / (lastEnd - firstStart)) * 100;
    return { progress };
  }, [seasons]);

  return (
    <Layout>
      <ProgressBar progress={progress} />
    </Layout>
  );
});

const Layout = styled('div', {
  base: {
    position: 'absolute',
    bottom: '0',
    left: '0',
    height: '2px',
    width: '100%',
    zIndex: '[1]',
  },
});
