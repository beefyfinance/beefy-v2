import { memo } from 'react';
import type { VisibleProps } from './types.ts';
import { useBreakpoint } from './useBreakpoint.ts';

export const Hidden = memo(function Hidden({
  children,
  else: elseChildren,
  ...rest
}: VisibleProps) {
  const shouldHide = useBreakpoint(rest);

  return shouldHide ? elseChildren || null : children;
});
