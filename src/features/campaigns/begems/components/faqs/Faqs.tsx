import { styled } from '@repo/styles/jsx';
import { memo, useCallback, useState } from 'react';
import { Faq, type FaqProps } from './Faq.tsx';

export type FaqsProps = {
  title: string;
  faqs: Array<Pick<FaqProps, 'question' | 'answer'>>;
};

export const Faqs = memo(function Faqs({ title, faqs }: FaqsProps) {
  const [open, setOpen] = useState(0);
  const handleChange = useCallback(
    (index: number) => {
      setOpen(index === open ? -1 : index);
    },
    [open]
  );

  return (
    <>
      <Title>{title}</Title>
      <List>
        {faqs.map((faq, index) => (
          <Faq
            key={faq.question}
            {...faq}
            index={index}
            open={index === open}
            onChange={handleChange}
          />
        ))}
      </List>
    </>
  );
});

const Title = styled('h2', {
  base: {
    textStyle: 'h3',
    textAlign: 'center',
    color: 'text.middle',
    marginBottom: '16px',
    md: {
      textStyle: 'h1',
    },
  },
});

const List = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    md: {
      gap: '12px',
    },
  },
});
