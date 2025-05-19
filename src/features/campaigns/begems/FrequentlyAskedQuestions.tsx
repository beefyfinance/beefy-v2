import { memo } from 'react';
import { Faqs } from './components/faqs/Faqs.tsx';
import { styled } from '@repo/styles/jsx';

const faqs = [
  {
    question: 'When can I redeem beGEMS?',
    answer:
      'At the end of each season, Beefy will open claims on this page allowing beGEMS holders to redeem them for S tokens.',
  },
  {
    question: 'How much is a beGEMS worth?',
    answer:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris.',
  },
  {
    question: 'When does the season end?',
    answer:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris.',
  },
  {
    question: 'How can I earn beGEMS?',
    answer:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris.',
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
