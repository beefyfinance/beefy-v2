import { css } from '@repo/styles/css';
import { memo } from 'react';

export type TextLoaderProps = {
  placeholder: string;
};

export const TextLoader = memo(function TextLoader({ placeholder }: TextLoaderProps) {
  return (
    <span className={holderClass}>
      <span className={placeholderClass}>{placeholder}</span>
      <span className={loaderClass} />
    </span>
  );
});

const holderClass = css({
  position: 'relative',
  display: 'inline-block',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  verticalAlign: 'bottom',
});

const placeholderClass = css({
  lineHeight: 'inherit',
  display: 'inline-block',
  opacity: '0',
  visibility: 'hidden',
  userSelect: 'none',
  pointerEvents: 'none',
});

const loaderClass = css({
  backgroundImage:
    'linear-gradient(90deg, transparent, {colors.loaderPurpleHighlight}, transparent)',
  backgroundSize: '300% 100%',
  animationName: 'scrollBackground',
  animationDuration: '3s',
  animationIterationCount: 'infinite',
  animationTimingFunction: 'ease',
  borderRadius: '0.25em',
  display: 'inline-block',
  position: 'absolute',
  height: '1em',
  width: '100%',
  left: '0',
  top: '50%',
  transform: 'translate(0,-50%)',
});
