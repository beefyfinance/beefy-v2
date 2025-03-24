import { styled } from '@repo/styles/jsx';

export const CardContent = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    borderBottomRadius: '12px',
    padding: '16px',
    sm: {
      padding: '24px',
    },
  },
});
