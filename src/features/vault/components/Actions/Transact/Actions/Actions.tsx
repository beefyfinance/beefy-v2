import { styled } from '@repo/styles/jsx';

export const Actions = styled('div', {
  base: {
    marginTop: '24px',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  variants: {
    gap: {
      default: {
        gap: '24px',
      },
      tight: {
        gap: '8px',
      },
    },
  },
  defaultVariants: {
    gap: 'default',
  },
});
