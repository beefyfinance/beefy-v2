import { styled } from '@repo/styles/jsx';
import { memo } from 'react';

export type PulseHighlightProps = {
  innerCircles?: number;
  size?: number;
  variant?: 'loading' | 'success' | 'warning';
  hidePulse?: boolean;
  animation?: 'indicator' | 'pulse';
};

export const PulseHighlight = memo<PulseHighlightProps>(function PulseHighlight({
  variant = 'loading',
  innerCircles = 4,
  size = 8,
  hidePulse = false,
  animation = 'indicator',
}) {
  return (
    <CircleOuter>
      <Circle style={{ width: size, height: size }} variant={variant}>
        {Array.from({ length: innerCircles }).map((_, index) => (
          <PulseCircle
            style={{ width: size, height: size }}
            variant={variant}
            key={index}
            hidePulse={hidePulse}
            animation={animation}
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
  },
  variants: {
    variant: {
      loading: {
        backgroundColor: 'indicators.loading',
      },
      success: {
        backgroundColor: 'indicators.success',
      },
      warning: {
        backgroundColor: 'indicators.warning',
      },
    },
  },
  defaultVariants: {
    variant: 'loading',
  },
});

const PulseCircle = styled('div', {
  base: {
    borderRadius: '50%',
    position: 'absolute',
    opacity: '0',
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
  variants: {
    animation: {
      indicator: {
        animation: 'loadingPulse 1s infinite ease-out',
      },
      pulse: {
        animation: 'loadingPulse 4s infinite cubic-bezier(.36, .11, .89, .32)',
      },
    },
    hidePulse: {
      true: {
        display: 'none',
      },
    },
    variant: {
      loading: {
        backgroundColor: 'indicators.loading',
      },
      success: {
        backgroundColor: 'indicators.success',
      },
      warning: {
        backgroundColor: 'indicators.warning',
      },
    },
  },
  defaultVariants: {
    variant: 'loading',
  },
});
