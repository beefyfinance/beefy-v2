import { styled } from '@repo/styles/jsx';

export const CardTitle = styled(
  'h2',
  {
    base: {
      color: 'text.light',
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
    },
  },
  {
    shouldForwardProp: prop => {
      return prop !== 'title';
    },
  }
);
