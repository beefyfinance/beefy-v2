import { styled } from '@repo/styles/jsx';

export const Container = styled('div', {
  base: {
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingInline: '12px',
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
    noPadding: {
      true: {
        padding: 0,
      },
    },
  },
  defaultVariants: {
    maxWidth: 'xl',
  },
});
