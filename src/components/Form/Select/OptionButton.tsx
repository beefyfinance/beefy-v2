import { styled } from '@repo/styles/jsx';

export const OptionButton = styled('button', {
  base: {
    display: 'flex',
    width: '100%',
    gap: '8px',
    userSelect: 'none',
    cursor: 'pointer',
    padding: '8px 14px',
    justifyContent: 'flex-start',
    textAlign: 'left',
    '&:hover': {
      backgroundColor: 'selectOptionActiveBackground',
    },
    '&:active': {
      backgroundColor: 'transparent',
      color: 'text.light',
    },
  },
  variants: {
    active: {
      true: {
        backgroundColor: 'selectOptionActiveBackground',
      },
    },
    selected: {
      true: {
        fontWeight: 'medium',
        color: 'text.light',
      },
    },
  },
});
