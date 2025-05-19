import { css } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';
import { memo, useCallback, useId } from 'react';
import AnimateHeight from 'react-animate-height';
import ChevronDown from '../../../../../images/icons/chevron-down.svg?react';

export type FaqProps = {
  question: string;
  answer: string;
  open: boolean;
  onChange: (index: number) => void;
  index: number;
};

export const Faq = memo(function Faq({ question, answer, open, onChange, index }: FaqProps) {
  const id = useId();
  const handleClick = useCallback(() => {
    onChange(index);
  }, [onChange, index]);

  return (
    <Box type="button" onClick={handleClick} aria-controls={id} aria-expanded={open}>
      <Header>
        <Title>{question}</Title>
        <ChevronDown className={iconClass} />
      </Header>
      <AnimateHeight id={id} duration={300} height={open ? 'auto' : 0}>
        <Answer>
          <p>{answer}</p>
        </Answer>
      </AnimateHeight>
    </Box>
  );
});

const Box = styled('button', {
  base: {
    padding: '14px 18px',
    borderRadius: '12px',
    border: '2px solid {colors.darkBlue.70}',
    color: 'text.dark',
    background: 'darkBlue.80',
    display: 'block',
    whiteSpace: 'wrap',
    textAlign: 'left',
    md: {
      padding: '24px 34px 24px 26px',
    },
  },
});

const Header = styled('div', {
  base: {
    display: 'flex',
    gap: '20px',
    width: '100%',
    alignItems: 'center',
  },
});

const Title = styled('h3', {
  base: {
    textStyle: 'body.medium',
    color: 'text.middle',
    flex: '1 1 auto',
    md: {
      textStyle: 'body.xl.medium',
    },
  },
});

const iconClass = css({
  width: '12px',
  height: '8px',
});

const Answer = styled('div', {
  base: {
    textStyle: 'body.md',
    paddingTop: '8px',
    md: {
      textStyle: 'body',
      paddingRight: '36px',
    },
  },
});
