import { styled } from '@repo/styles/jsx';
import { memo, useState } from 'react';
import { useAppSelector } from '../../data/store/hooks.ts';
import {
  selectBeGemsDefaultSeason,
  selectIsBeGemsCampaignAvailable,
} from '../../data/selectors/campaigns/begems.ts';
import { Loading } from '../../home/components/Loading/Loading.tsx';
import { FrequentlyAskedQuestions } from './FrequentlyAskedQuestions.tsx';
import { Seasons } from './Seasons.tsx';

const BeGemsPageLoader = memo(() => {
  const isAvailable = useAppSelector(selectIsBeGemsCampaignAvailable);

  return isAvailable ? <BeGemsPage /> : <Loading />;
});

const BeGemsPage = memo(() => {
  const defaultSeason = useAppSelector(selectBeGemsDefaultSeason);
  const [season, setSeason] = useState(defaultSeason);

  return (
    <Layout>
      <Seasons season={season} setSeason={setSeason} />
      <FrequentlyAskedQuestions season={season} />
    </Layout>
  );
});

const Layout = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '100%',
    overflowX: 'hidden',
    gap: '32px',
    paddingBlock: '24px 104px',
    sm: {
      paddingBlock: '32px 64px',
      gap: '136px',
    },
    lg: {
      paddingBlock: '152px 184px',
    },
  },
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default BeGemsPageLoader;
