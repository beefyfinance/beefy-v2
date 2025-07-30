import { styled } from '@repo/styles/jsx';

export const NotificationDot = styled('div', {
  base: {
    backgroundColor: 'orange.40',
    padding: '0',
    borderRadius: '100%',
    height: '5px',
    width: '5px',
    position: 'absolute',
    top: '0px',
    right: '0',
    transform: 'translate(50%, -50%)',
    pointerEvents: 'none',
    lg: {
      top: '-5px',
      right: '-5px',
    },
  },
});
