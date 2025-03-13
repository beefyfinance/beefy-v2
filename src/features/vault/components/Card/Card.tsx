import { styled } from '@repo/styles/jsx';

export const Card = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    outline: 'none',
    borderRadius: '12px',
    backgroundColor: 'background.content',
  },
  variants: {
    width: {
      lg: {
        width: 'containerInner.lg',
      },
      md: {
        width: 'containerInner.md',
      },
      sm: {
        width: 'containerInner.sm',
      },
      xs: {
        width: 'containerInner.xs',
      },
    },
    maxWidth: {
      xl: {
        maxWidth: '100%',
      },
      lg: {
        maxWidth: 'container.lg',
      },
      md: {
        maxWidth: 'container.md',
      },
      sm: {
        maxWidth: 'container.sm',
      },
      xs: {
        maxWidth: 'container.xs',
      },
    },
  },
  defaultVariants: {
    maxWidth: 'xl',
  },
});
