import { memo } from 'react';
import { Container } from '../../../components/Container/Container.tsx';
import { Faqs } from './components/faqs/Faqs.tsx';

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
    <Container maxWidth="sm">
      <Faqs title="Frequently Asked Questions" faqs={faqs} />
    </Container>
  );
});
