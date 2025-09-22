import { memo } from 'react';
import { styled } from '@repo/styles/jsx';
import { Count } from '../../../Count/Count.tsx';

type NotificationCountProps = {
  count: number;
};

export const NotificationCount = memo<NotificationCountProps>(function NotificationCount({
  count,
}) {
  return <Badge data-count={count} />;
});

const Badge = styled(Count, {
  base: {
    marginLeft: '6px',
    lg: {
      marginLeft: 'auto',
    },
  },
});
