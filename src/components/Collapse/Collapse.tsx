import type { CollapseProps } from './types.ts';
import { memo } from 'react';

export const Collapse = memo(function Collapse({ in: inProp, children }: CollapseProps) {
  return inProp ? <>{children}</> : null;
});
