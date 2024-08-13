import { memo } from 'react';

export type ItemInnerProps<V extends string = string> = {
  value: V;
};

export const ItemInner = memo(function ItemInner<V extends string = string>({
  value,
}: ItemInnerProps<V>) {
  return <>{value}</>;
});
