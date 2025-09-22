import { memo, useMemo } from 'react';
import { getUnixNow } from '../../../helpers/date.ts';
import { useAppSelector } from '../../data/store/hooks.ts';
import { selectBeGemsSeasons } from '../../data/selectors/campaigns/begems.ts';
import { ProgressBar } from './components/ProgressBar.tsx';
import { styled } from '@repo/styles/jsx';

export const SeasonProgressBar = memo(function SeasonProgressBar() {
  const seasons = useAppSelector(selectBeGemsSeasons);
  const progress = useMemo(() => {
    if (seasons.length === 0) {
      return 0;
    }
    const now = getUnixNow();
    const currentSeason = seasons.findLast(season => now >= season.startTime);
    if (currentSeason === undefined) {
      // none have started yet
      return 0;
    }
    if (now >= currentSeason.endTime) {
      // all have ended
      return 100;
    }

    const currentSeasonIndex = seasons.indexOf(currentSeason);
    const progressPerSeason = 100 / seasons.length;
    const priorProgress = currentSeasonIndex * progressPerSeason;
    const thisProgress =
      ((now - currentSeason.startTime) / (currentSeason.endTime - currentSeason.startTime)) *
      progressPerSeason;

    return priorProgress + thisProgress;
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
    pointerEvents: 'none',
  },
});
