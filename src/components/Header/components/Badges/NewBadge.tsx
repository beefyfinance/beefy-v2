import { styled } from '@repo/styles/jsx';
import { NewBadge as BaseNewBadge } from '../../../Badges/NewBadge.tsx';

export const NewBadge = styled(BaseNewBadge, {
  base: {
    position: 'absolute',
    top: '-2px',
    right: '0',
    transform: 'translate(50%, -50%)',
  },
});
