import { styled } from '@repo/styles/jsx';

export const Container = styled('div', {
  base: {
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingInline: '12px',
    sm: {
      paddingInline: '24px',
    },
  },
  variants: {
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
