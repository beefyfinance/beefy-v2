import { styled } from '@repo/styles/jsx';

export const Stats = styled('div', {
  base: {
    display: 'flex',
    rowGap: '8px',
    columnGap: '8px',
    justifyContent: 'inherit',
    textAlign: 'inherit',
    md: {
      columnGap: '32px',
    },
  },
});
