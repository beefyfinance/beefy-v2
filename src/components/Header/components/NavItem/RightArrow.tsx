import { styled } from '@repo/styles/jsx';
import ForwardArrowIcon from '../../../../images/icons/forward-arrow.svg?react';

export const RightArrow = function RightArrow() {
  return (
    <ArrowContainer>
      <ForwardArrowIcon />
    </ArrowContainer>
  );
};

const ArrowContainer = styled('div', {
  base: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '20px',
    width: '20px',
    marginLeft: 'auto',
  },
});
