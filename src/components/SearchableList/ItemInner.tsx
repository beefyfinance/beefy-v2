import React, { memo } from 'react';

export type ItemInnerProps = {
  value: string;
};

export const ItemInner = memo<ItemInnerProps>(function ({ value }) {
  return <>{value}</>;
});
