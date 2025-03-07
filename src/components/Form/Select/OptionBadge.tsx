import { styled } from '@repo/styles/jsx';

export const OptionBadge = styled('span', {
  base: {
    textStyle: 'body.sm',
    backgroundColor: 'tags.clm.background',
    color: 'text.light',
    padding: '0px 6px',
    borderRadius: '10px',
    height: '20px',
    pointerEvents: 'none',
    flex: '0 0 auto',
  },
  variants: {
    selected: {
      true: {},
    },
  },
});
