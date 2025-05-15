import { css, cx } from '@repo/styles/css';
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
    <Box>
      <Header type="button" onClick={handleClick} aria-controls={id} aria-expanded={open}>
        <Title>{question}</Title>
        <ChevronDown className={cx(iconClass, open && iconOpenClass)} />
      </Header>
      <AnimateHeight id={id} duration={300} height={open ? 'auto' : 0}>
        <Answer>
          <p>{answer}</p>
        </Answer>
      </AnimateHeight>
    </Box>
  );
});

const Box = styled('div', {
  base: {
    padding: '16px 20px',
    borderRadius: '12px',
    border: '2px solid {colors.darkBlue.70}',
    color: 'text.dark',
    background: 'darkBlue.80',
  },
});

const Header = styled('button', {
  base: {
    display: 'flex',
    gap: '20px',
    width: '100%',
    textAlign: 'left',
  },
});

const Title = styled('h3', {
  base: {
    textStyle: 'body.medium',
    color: 'text.middle',
    flex: '1 1 auto',
  },
});

const iconClass = css({
  width: '12px',
  height: '8px',
  transition: 'transform 0.3s ease',
});

const iconOpenClass = css({
  transform: 'rotate(-180deg)',
});

const Answer = styled('div', {
  base: {
    textStyle: 'body.md',
    paddingTop: '8px',
  },
});
