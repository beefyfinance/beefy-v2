import { memo } from 'react';
import { css, type CssStyles } from '@repo/styles/css';

const loaderStyle = css.raw({
  borderRadius: '50%',
  background: 'conic-gradient(from 0deg, #151728, #95E2A8)',
  animationName: 'rotate',
  animationDuration: '1800ms',
  animationTimingFunction: 'linear',
  animationIterationCount: 'infinite',
  mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))',
  WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))',
});

export type SpinLoaderProps = {
  size?: number;
  css?: CssStyles;
};

export const SpinLoader = memo(function SpinLoader({ size = 14, css: cssProp }: SpinLoaderProps) {
  return <div className={css(loaderStyle, cssProp)} style={{ width: size, height: size }} />;
});
