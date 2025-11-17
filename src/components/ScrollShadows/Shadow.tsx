import { styled } from '@repo/styles/jsx';

export const Shadow = styled('div', {
  base: {
    position: 'absolute',
    pointerEvents: 'none',
    transition: 'opacity 0.2s linear',
    left: '0',
    right: '0',
    height: '55px',
  },
  variants: {
    position: {
      top: {
        top: 0,
        opacity: 0,
        background: 'linear-gradient(180deg, var(--shadow-bg, #111321) 0%, transparent 100%)',
      },
      bottom: {
        bottom: 0,
        opacity: 1,
        background: 'linear-gradient(0deg, var(--shadow-bg, #111321) 0%, transparent 100%)',
      },
    },
  },
});
