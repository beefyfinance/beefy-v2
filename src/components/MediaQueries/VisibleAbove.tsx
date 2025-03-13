import { memo, type PropsWithChildren } from 'react';
import { useMediaQuery } from './useMediaQuery.ts';

type VisibleAboveProps = PropsWithChildren<{
  width: number;
}>;

/** @dev use <Visible/> or <Hidden/> if matching a breakdown */
export const VisibleAbove = memo(function VisibleAbove({ width, children }: VisibleAboveProps) {
  const aboveWidth = useMediaQuery(`(min-width: ${width}px)`);
  return aboveWidth ? children : null;
});
