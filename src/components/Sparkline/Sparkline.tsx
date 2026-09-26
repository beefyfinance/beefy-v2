import { memo, useId } from 'react';
import { token } from '@repo/styles/tokens';

type SparklineProps = {
  values: number[];
  variant: 'bars' | 'line';
};

const COLOR = token('colors.graph.bar.range');

// viewBox units; the svg stretches to its box (preserveAspectRatio none)
const WIDTH = 100;
const HEIGHT = 30;
const BAR_GAP = 1.5;

/** Tiny trend chart in plain SVG, so it doesn't pull recharts into the page */
export const Sparkline = memo(function Sparkline({ values, variant }: SparklineProps) {
  // useId's colons would break the url(#…) reference
  const fillId = `sparkline-fill${useId().replace(/[^a-zA-Z0-9-]/g, '')}`;
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = variant === 'bars' ? 0 : Math.min(...values);
  const span = max - min || 1;
  const y = (v: number) => HEIGHT - ((v - min) / span) * HEIGHT;
  const line = values.map((v, i) => `${(i / (values.length - 1)) * WIDTH},${y(v)}`).join(' ');

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      aria-hidden={true}
    >
      {variant === 'line' ?
        <>
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLOR} stopOpacity={1} />
              <stop offset="100%" stopColor={COLOR} stopOpacity={0} />
            </linearGradient>
          </defs>
          <polygon points={`0,${HEIGHT} ${line} ${WIDTH},${HEIGHT}`} fill={`url(#${fillId})`} />
          <polyline
            points={line}
            fill="none"
            stroke={COLOR}
            strokeWidth={1.5}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </>
      : values.map((v, i) => {
          const barWidth = (WIDTH - BAR_GAP * (values.length - 1)) / values.length;
          const top = Math.min(y(v), HEIGHT - 1);
          return (
            <rect
              key={i}
              x={i * (barWidth + BAR_GAP)}
              y={top}
              width={barWidth}
              height={HEIGHT - top}
              fill={COLOR}
            />
          );
        })
      }
    </svg>
  );
});
