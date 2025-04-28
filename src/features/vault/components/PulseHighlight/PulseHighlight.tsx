import { styled } from '@repo/styles/jsx';
import { memo } from 'react';
import type { StyledVariantProps } from '@repo/styles/types';

type SizerVariantProps = StyledVariantProps<typeof Sizer>;
type CircleVariantProps = StyledVariantProps<typeof Circle>;

export type PulseHighlightProps = {
  innerCircles?: number;
  size?: number;
  variant?: SizerVariantProps['variant'];
  state?: CircleVariantProps['state'];
};

export const PulseHighlight = memo<PulseHighlightProps>(function PulseHighlight({
  variant = 'loading',
  size = 20,
  state = 'playing',
}) {
  return (
    <Sizer style={{ width: size, height: size }} variant={variant}>
      <Circle slot={3} state={state} />
      <Circle slot={2} state={state} />
      <Circle slot={1} state={state} />
    </Sizer>
  );
});

const Sizer = styled('div', {
  base: {
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  variants: {
    variant: {
      loading: {
        colorPalette: 'indicators.loading',
      },
      success: {
        colorPalette: 'indicators.success',
      },
      warning: {
        colorPalette: 'indicators.warning',
      },
      error: {
        colorPalette: 'indicators.error',
      },
    },
  },
  defaultVariants: {
    variant: 'loading',
  },
});

const Circle = styled('div', {
  base: {
    borderRadius: '50%',
    position: 'absolute',
    width: '100%',
    height: '100%',
    animationDuration: '700ms',
    animationDelay: '1ms',
    animationTimingFunction: 'ease-out',
    animationIterationCount: 'infinite',
  },
  variants: {
    slot: {
      3: {
        // marker-1/03
        backgroundColor: 'colorPalette.fg',
        transform: 'scale(0.3)', // 6px
      },
      2: {
        // marker-1/02
        backgroundColor: 'colorPalette.fg',
        transform: 'scale(1)', // 20px
        opacity: '0',
      },
      1: {
        // marker-1/01
        backgroundColor: 'colorPalette.bg',
        transform: 'scale(1)', // 20px
      },
    },
    state: {
      stopped: {
        animationName: 'none',
      },
      playing: {},
    },
  },
  compoundVariants: [
    {
      slot: 3,
      state: 'playing',
      css: {
        animationName: 'pulse3',
      },
    },
    {
      slot: 2,
      state: 'playing',
      css: {
        animationName: 'pulse2',
      },
    },
    {
      slot: 1,
      state: 'playing',
      css: {
        animationName: 'pulse1',
      },
    },
  ],
  defaultVariants: {
    state: 'playing',
  },
});
