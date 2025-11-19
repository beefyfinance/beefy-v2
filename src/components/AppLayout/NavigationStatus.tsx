import { styled } from '@repo/styles/jsx';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useNavigation } from 'react-router';

/** bar fill, in seconds */
const animationLength = 10;

type BarState = 'idle' | 'waiting' | 'progressing' | 'flashing' | 'closing';

export const NavigationStatus = memo(() => {
  const navigation = useNavigation();
  const isNavigating = navigation.state !== 'idle';
  const ref = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<BarState>('idle');

  const waitNextState = useCallback(
    (wait: number, nextState: BarState) => {
      let id: ReturnType<typeof setTimeout> | undefined;

      const clear = () => {
        if (id) {
          clearTimeout(id);
          id = undefined;
        }
      };

      const next = () => {
        clear();
        setState(nextState);
      };

      id = setTimeout(next, wait);

      return clear;
    },
    [setState]
  );

  useEffect(() => {
    switch (state) {
      case 'idle': {
        if (isNavigating) {
          return setState('waiting');
        }
        break;
      }
      case 'waiting': {
        if (!isNavigating) {
          return setState('idle');
        }
        break;
      }
      case 'progressing': {
        if (!isNavigating) {
          setState('closing');
        }
        break;
      }
      case 'flashing': {
        if (!isNavigating) {
          setState('closing');
        }
        break;
      }
      case 'closing': {
        break;
      }
    }
  }, [isNavigating, state, setState]);

  useEffect(() => {
    switch (state) {
      case 'idle': {
        break;
      }
      case 'waiting': {
        return waitNextState(200, 'progressing');
      }
      case 'progressing': {
        return waitNextState(animationLength * 1000, 'flashing');
      }
      case 'closing': {
        return waitNextState(200, 'idle');
      }
    }
  }, [state, waitNextState]);

  return (
    <Progress>
      <Bar ref={ref} state={state} />
    </Progress>
  );
});

const Progress = styled('div', {
  base: {
    height: '2px',
    position: 'absolute',
    inset: '0 0 auto 0',
    pointerEvents: 'none',
    overflow: 'hidden',
    zIndex: 'badge',
  },
});

const Bar = styled('div', {
  base: {
    backgroundColor: 'white.70',
    width: '100%',
    height: '100%',
    transition: 'transform 0.2s linear, opacity 0.3s linear',
    transform: 'translateX(-100%)',
    opacity: '0',
  },
  variants: {
    state: {
      idle: {},
      waiting: {
        opacity: '1',
      },
      progressing: {
        transform: 'translateX(0%)',
        transition: `transform ${animationLength}s cubic-bezier(.16,1,.35,.83), opacity 0.3s linear`,
        opacity: '1',
      },
      closing: {
        transform: 'translateX(0%)',
        transition: 'transform 0.2s linear, opacity 0.5s linear',
      },
      flashing: {
        opacity: '1',
        transform: 'translateX(0%)',
        animationName: 'fadeOutLoop',
        animationDuration: '3s',
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
      },
    },
  },
});
