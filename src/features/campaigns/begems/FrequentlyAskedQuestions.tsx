import { memo } from 'react';
import { Faqs } from './components/faqs/Faqs.tsx';
import { styled } from '@repo/styles/jsx';
import { useAppSelector } from '../../data/store/hooks.ts';
import { selectBeGemsSeasonFaqs } from '../../data/selectors/campaigns/begems.ts';

type FrequentlyAskedQuestionsProps = {
  season: number;
};

export const FrequentlyAskedQuestions = memo(function ({ season }: FrequentlyAskedQuestionsProps) {
  const faqs = useAppSelector(state => selectBeGemsSeasonFaqs(state, season));
  if (!faqs || faqs.length === 0) {
    return null;
  }

  return (
    <Layout>
      <Faqs title="Frequently Asked Questions" faqs={faqs} />
    </Layout>
  );
});

const Layout = styled('div', {
  base: {
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingInline: '12px',
    sm: {
      paddingInline: '24px',
      maxWidth: '696px',
    },
  },
});
