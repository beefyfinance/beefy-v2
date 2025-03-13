import { css } from '@repo/styles/css';

export const styles = {
  holder: css.raw({
    backgroundImage:
      'linear-gradient(90deg, {colors.loaderPurple}, {colors.loaderPurpleHighlight}, {colors.loaderPurple})',
    backgroundSize: '300% 100%',
    animationName: 'scrollBackground',
    animationDuration: '3s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease',
    borderRadius: '50%',
    width: '48px',
    height: '48px',
  }),
};
