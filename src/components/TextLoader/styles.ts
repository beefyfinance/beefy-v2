import { css } from '@repo/styles/css';

export const styles = {
  placeholder: css.raw({
    lineHeight: 'inherit',
    display: 'inline-block',
    opacity: '0',
    visibility: 'hidden',
    userSelect: 'none',
    pointerEvents: 'none',
  }),
  holder: css.raw({
    display: 'inline-block',
    position: 'relative',
  }),
  loader: css.raw({
    backgroundImage: 'linear-gradient(90deg, extracted198, extracted2029, extracted198)',
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
  }),
};
