import { styled } from '@repo/styles/jsx';

export const SelectLabel = styled('span', {
  base: {
    textStyle: 'body.med',
    flex: '1 1 auto',
    minWidth: '0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  variants: {
    selected: {
      true: {},
    },
  },
});
