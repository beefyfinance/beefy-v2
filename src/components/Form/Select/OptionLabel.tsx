import { styled } from '@repo/styles/jsx';

export const OptionLabel = styled('span', {
  base: {
    flex: '1 1 auto',
    minWidth: '0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: 'text.dark',
  },
  variants: {
    selected: {
      true: {
        color: 'text.light',
      },
    },
  },
});
