import { styled } from '@repo/styles/jsx';

export const TabButton = styled('button', {
  base: {
    textStyle: 'body.medium',
    position: 'relative',
    flexBasis: '1px',
    flexGrow: 1,
    flexShrink: 0,
    color: 'text.dark',
    paddingBlock: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    _hover: {
      color: 'text.middle',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      bottom: 0,
      right: 0,
      height: '2px',
      backgroundColor: 'background.border',
    },
    '&:first-child': {
      borderTopLeftRadius: '12px',
    },
    '&:last-child': {
      borderTopRightRadius: '12px',
    },
  },
  variants: {
    selected: {
      true: {
        color: 'text.light',
        cursor: 'default',
        pointerEvents: 'none',
        '&::before': {
          backgroundColor: 'text.dark',
        },
      },
    },
  },
});
