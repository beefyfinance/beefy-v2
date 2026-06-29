import { type CssStyles } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';
import { memo, useCallback, useEffect, useState, type CSSProperties } from 'react';

const DEFAULT_AUTO_REFRESH_SECONDS = 10;
const REFRESH_SPIN_MS = 600;

const SOLID =
  'M16.6758 9.14062H10.8594L13.5352 6.46484C12.6377 5.55912 11.4077 4.9854 10.0283 4.98535C7.52288 4.98535 5.44522 6.84057 5.09473 9.25H3.42773C3.78625 5.91693 6.5993 3.32422 10.0283 3.32422C11.8647 3.32427 13.5188 4.07149 14.7236 5.27637L16.6758 3.32422V9.14062Z';
const DASHES = [
  'M5.10352 10.75C5.23013 11.555 5.5498 12.2959 6.01367 12.9248L4.83008 14.1084C4.07998 13.1643 3.58217 12.0116 3.43555 10.75H5.10352Z',
  'M7.07422 13.9854C7.70335 14.4493 8.44472 14.7689 9.25 14.8955V16.5723C7.98645 16.425 6.83335 15.9237 5.88965 15.1699L7.07422 13.9854Z',
  'M14.1328 15.1934C13.1826 15.9455 12.022 16.4407 10.75 16.5781V14.9033C11.5633 14.7851 12.3122 14.4706 12.9482 14.0088L14.1328 15.1934Z',
  'M16.4512 11.6338C16.2117 12.5621 15.7775 13.4109 15.1963 14.1357L14.0166 12.9561C14.3147 12.5571 14.5551 12.1125 14.7236 11.6338H16.4512Z',
];

export type ReloadSpinnerProps = {
  autoRefresh?: boolean;
  autoRefreshSeconds?: number;
  onClick?: () => void;
  css?: CssStyles;
};

export const ReloadSpinner = memo(function ReloadSpinner({
  autoRefresh = false,
  autoRefreshSeconds = DEFAULT_AUTO_REFRESH_SECONDS,
  onClick,
  css: cssProp,
}: ReloadSpinnerProps) {
  const [disabledCount, setDisabledCount] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [cycleNonce, setCycleNonce] = useState(0);

  useEffect(() => {
    if (!spinning) {
      return;
    }
    const timer = window.setTimeout(() => setSpinning(false), REFRESH_SPIN_MS);
    return () => window.clearTimeout(timer);
  }, [spinning]);

  useEffect(() => {
    if (!autoRefresh) {
      setDisabledCount(0);
      return;
    }

    // split the duration into (dash count + 1) steps: one disables each dash, the last triggers
    // the spin (e.g. 10s / 5 → disable a dash at 2s, 4s, 6s, 8s; spin at 10s)
    const totalMs = autoRefreshSeconds * 1000;
    const stepMs = totalMs / (DASHES.length + 1);
    const timers: number[] = [];
    setDisabledCount(0);
    for (let i = 1; i <= DASHES.length; i++) {
      timers.push(window.setTimeout(() => setDisabledCount(i), stepMs * i));
    }
    timers.push(window.setTimeout(() => setSpinning(true), totalMs));
    timers.push(window.setTimeout(() => setCycleNonce(n => n + 1), totalMs + REFRESH_SPIN_MS));

    return () => timers.forEach(window.clearTimeout);
  }, [autoRefresh, autoRefreshSeconds, cycleNonce]);

  const handleClick = useCallback(() => {
    setSpinning(true);
    setCycleNonce(n => n + 1);
    onClick?.();
  }, [onClick]);

  return (
    <Button type="button" css={cssProp} onClick={handleClick}>
      <Icon viewBox="0 0 20 20" fill="currentColor" aria-hidden={true}>
        <Rotor
          spinning={spinning}
          style={
            spinning ? ({ animationDuration: `${REFRESH_SPIN_MS}ms` } as CSSProperties) : undefined
          }
        >
          <path d={SOLID} />
          {DASHES.map((d, idx) => (
            <Dash key={idx} dimmed={disabledCount > DASHES.length - 1 - idx} d={d} />
          ))}
        </Rotor>
      </Icon>
    </Button>
  );
});

const Button = styled('button', {
  base: {
    padding: '0',
    margin: '0 0 0 auto',
    flexShrink: '0',
    flexGrow: '0',
    background: 'transparent',
    boxShadow: 'none',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    lineHeight: '1',
    width: '24px',
    height: '24px',
    position: 'relative',
  },
});

const Icon = styled('svg', {
  base: {
    display: 'block',
    width: '24px',
    height: '24px',
    color: 'green.40',
  },
});

const Rotor = styled('g', {
  base: {
    transformBox: 'fill-box',
    transformOrigin: 'center',
  },
  variants: {
    spinning: {
      true: {
        animationName: 'rotate',
        animationTimingFunction: 'ease-in-out',
        animationIterationCount: '1',
      },
    },
  },
});

const Dash = styled('path', {
  base: {
    opacity: '0.6',
    transition: 'opacity 300ms ease',
  },
  variants: {
    dimmed: {
      true: {
        opacity: '0.24',
      },
    },
  },
});
