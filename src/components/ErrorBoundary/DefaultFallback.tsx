import { memo } from 'react';
import { AlertError } from '../Alerts';
import type { FallbackComponentProps } from './types';

export const DefaultFallback = memo<FallbackComponentProps>(function DefaultFallback() {
  return <AlertError>{'An unexpected error occurred. Please reload and try again.'}</AlertError>;
});
