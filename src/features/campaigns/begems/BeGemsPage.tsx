import { styled } from '@repo/styles/jsx';
import { memo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../data/store/hooks.ts';
import { initCampaignBeGems } from '../../data/actions/campaigns/begems.ts';
import {
  selectHasBeGemsCampaignDispatchedRecently,
  selectIsBeGemsCampaignAvailable,
} from '../../data/selectors/campaigns/begems.ts';
import { Loading } from '../../home/components/Loading/Loading.tsx';
import { FrequentlyAskedQuestions } from './FrequentlyAskedQuestions.tsx';
import { Seasons } from './Seasons.tsx';

const BeGemsPageLoader = memo(() => {
  const dispatch = useAppDispatch();
  const loadingStarted = useAppSelector(selectHasBeGemsCampaignDispatchedRecently);
  const isAvailable = useAppSelector(selectIsBeGemsCampaignAvailable);

  useEffect(() => {
    if (!isAvailable && !loadingStarted) {
      dispatch(initCampaignBeGems());
    }
  }, [dispatch, loadingStarted, isAvailable]);

  return isAvailable ? <BeGemsPage /> : <Loading />;
});

const BeGemsPage = memo(() => {
  return (
    <Layout>
      <Seasons />
      <FrequentlyAskedQuestions />
    </Layout>
  );
});

const Layout = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    gap: '40px',
    paddingBlock: '24px 104px',
    md: {
      paddingBlock: '150px',
      gap: '64px',
    },
  },
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default BeGemsPageLoader;
