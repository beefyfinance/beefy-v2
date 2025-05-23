import { memo } from 'react';
import { Faqs } from './components/faqs/Faqs.tsx';
import { styled } from '@repo/styles/jsx';

const faqs = [
  {
    question: 'How can I earn beGEMS?',
    answer:
      'You can earn beGEMS by boosting specific vaults, providing liquidity to Sonic lending markets, and voting on key beS trading pairs on Sonic exchanges.',
  },
  {
    question: 'How much is a beGEMS worth?',
    answer:
      "beGEMS are redeemable for a proportional share of Beefy's Sonic Gems allocation at the end of each season. Their value depends on how many Sonic Gems Beefy earns during that season.",
  },
  {
    question: 'When can I redeem beGEMS?',
    answer:
      'At the end of each season, the redeem module above will become active, allowing beGEMS holders to claim S tokens.',
  },
  {
    question: 'When does the season end?',
    answer:
      'Season 1 ends in June. Start and end dates for future seasons haven’t been announced yet.',
  },
];

export const FrequentlyAskedQuestions = memo(function () {
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
