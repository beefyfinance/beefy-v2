import { styled } from '@repo/styles/jsx';
import { memo } from 'react';

export type PulseHighlightProps = {
  colorClassName: string;
  innerCircles?: number;
  size?: number;
};

export const PulseHighlight = memo<PulseHighlightProps>(function PulseHighlight({
  colorClassName,
  innerCircles = 4,
  size = 8,
}) {
  return (
    <CircleOuter>
      <Circle style={{ width: size, height: size }} className={colorClassName}>
        {Array.from({ length: innerCircles }).map((_, index) => (
          <PulseCircle
            style={{ width: size, height: size }}
            className={colorClassName}
            key={index}
          />
        ))}
      </Circle>
    </CircleOuter>
  );
});

const CircleOuter = styled('div', {
  base: {
    width: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const Circle = styled('div', {
  base: {
    borderRadius: '30px',
    position: 'relative',
    '&.loading': {
      backgroundColor: 'indicators.loading',
    },
    '&.success': {
      backgroundColor: 'indicators.success',
    },
    '&.warning': {
      backgroundColor: 'indicators.warning',
    },
  },
});

const PulseCircle = styled('div', {
  base: {
    borderRadius: '50%',
    position: 'absolute',
    opacity: '0',
    animation: 'loadingPulse 4s infinite cubic-bezier(.36, .11, .89, .32)',
    '&.loading': {
      backgroundColor: 'indicators.loading',
    },
    '&.success': {
      backgroundColor: 'indicators.success',
    },
    '&.warning': {
      backgroundColor: 'indicators.warning',
    },
    '&.notLoading': {
      display: 'none',
    },
    '&:nth-child(1)': {
      animationDelay: '0s',
    },
    '&:nth-child(2)': {
      animationDelay: '1s',
    },
    '&:nth-child(3)': {
      animationDelay: '2s',
    },
    '&:nth-child(4)': {
      animationDelay: '3s',
    },
  },
});
