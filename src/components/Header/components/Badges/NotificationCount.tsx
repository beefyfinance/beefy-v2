import { memo } from 'react';
import { styled } from '@repo/styles/jsx';

type NotificationCountProps = {
  count: number;
};

export const NotificationCount = memo<NotificationCountProps>(function NotificationCount({
  count,
}) {
  return <Badge>{count}</Badge>;
});

const Badge = styled('div', {
  base: {
    textStyle: 'body.sm',
    backgroundColor: 'indicators.warning',
    color: 'text.light',
    pointerEvents: 'none',
    marginLeft: '6px',
    borderRadius: '100%',
    width: '20px',
    height: '20px',
    lineHeight: '20px',
    textAlign: 'center',
  },
});
