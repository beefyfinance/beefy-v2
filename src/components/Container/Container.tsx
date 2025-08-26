import { type HTMLStyledProps, styled } from '@repo/styles/jsx';

export type ContainerProps = HTMLStyledProps<typeof Container>;

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
        paddingInline: 0,
      },
    },
  },
  defaultVariants: {
    maxWidth: 'xl',
  },
});
