import { memo } from 'react';
import type { FallbackComponentProps } from './types.ts';

export const MinimalFallback = memo<FallbackComponentProps>(function MinimalFallback() {
  return <div>{'An unexpected error occurred. Please reload and try again.'}</div>;
});
