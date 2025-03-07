import { memo, useMemo } from 'react';
import { css, cx } from '@repo/styles/css';

export type CircularProgressProps = {
  size?: number;
  className?: string;
};

export const CircularProgress = memo(function CircularProgress({
  size = 44,
  className,
}: CircularProgressProps) {
  const holderStyle = useMemo(() => ({ width: size, height: size }), [size]);

  return (
    <div className={cx(containerCss, className)} style={holderStyle}>
      <svg className={svgCss} width={size} height={size} viewBox="22 22 44 44">
        <circle className={circleCss} cx="44" cy="44" r="20.2" strokeWidth="3.6" fill="none" />
      </svg>
    </div>
  );
});

const containerCss = css({
  display: 'inline-block',
});

const svgCss = css({
  width: '100%',
  height: '100%',
  display: 'block',
  fill: 'none',
  animation: 'rotate 1.4s linear infinite',
});

const circleCss = css({
  fill: 'none',
  stroke: 'currentColor',
  animation: 'circularProgressDash 1.4s ease-in-out infinite',
  strokeDasharray: '0px, 200px',
  strokeDashoffset: '0px',
});
