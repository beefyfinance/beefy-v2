import { styled } from '@repo/styles/jsx';

export const OptionButton = styled('button', {
  base: {
    display: 'flex',
    width: '100%',
    gap: '8px',
    userSelect: 'none',
    cursor: 'pointer',
    justifyContent: 'flex-start',
    textAlign: 'left',
    paddingBlock: '10px',
    lg: {
      paddingBlock: '8px',
    },
    '&:active': {
      backgroundColor: 'transparent',
      color: 'text.light',
    },
  },
  variants: {
    active: {
      true: {},
    },
    selected: {
      true: {
        color: 'text.light',
      },
    },
  },
});
