import { styled } from '@repo/styles/jsx';
import { memo } from 'react';

export type PulseHighlightProps = {
  innerCircles?: number;
  size?: number;
  variant?: 'loading' | 'success' | 'warning';
  hidePulse?: boolean;
};

export const PulseHighlight = memo<PulseHighlightProps>(function PulseHighlight({
  variant = 'loading',
  innerCircles = 4,
  size = 8,
  hidePulse = false,
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
    animation: 'loadingPulse 1s infinite ease-out',
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
