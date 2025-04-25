import { styled } from '@repo/styles/jsx';
import { NewBadge as BaseNewBadge } from '../../../Badges/NewBadge.tsx';

export const NewBadge = styled(BaseNewBadge, {
  base: {
    backgroundColor: 'gold.80-32',
    color: 'text.boosted',
    borderRadius: '4px',
    position: 'absolute',
    top: '-2px',
    right: '0',
    transform: 'translate(50%, -50%)',
    md: {},
  },
});
