import { styled } from '@repo/styles/jsx';

export const Dialog = styled('div', {
  base: {
    display: 'flex',
    minHeight: '0',
    minWidth: '0',
    maxWidth: '100%',
  },
  variants: {
    scrollable: {
      false: {
        maxHeight: '100%',
      },
    },
    position: {
      center: {
        margin: 'auto',
        padding: { sm: '24px' },
      },
      right: {
        marginLeft: 'auto',
      },
      left: {
        marginRight: 'auto',
      },
    },
  },
  defaultVariants: {
    scrollable: false,
    position: 'center',
  },
});
