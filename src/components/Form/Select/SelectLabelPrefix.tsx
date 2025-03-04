import { styled } from '@repo/styles/jsx';

export const SelectLabelPrefix = styled('span', {
  base: {
    flex: '0 0 auto',
    color: 'text.dark',
  },
  variants: {
    selected: {
      true: {},
    },
  },
});
