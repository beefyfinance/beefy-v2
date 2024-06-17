import { memo } from 'react';
import type { FallbackComponentProps } from './ErrorBoundary';
import { AlertError } from '../Alerts';

export const DefaultFallback = memo<FallbackComponentProps>(function DefaultFallback() {
  return <AlertError>{'An unexpected error occurred. Please reload and try again.'}</AlertError>;
});
