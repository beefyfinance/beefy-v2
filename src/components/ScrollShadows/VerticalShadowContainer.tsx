import { styled } from '@repo/styles/jsx';

export const VerticalShadowContainer = styled('div', {
  base: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '0',
    flex: '0 1 auto',
    width: '100%',
  },
});
