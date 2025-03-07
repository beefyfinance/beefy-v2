import { memo } from 'react';
import { AlertError } from '../Alerts/Alerts.tsx';
import type { FallbackComponentProps } from './types.ts';

export const DefaultFallback = memo<FallbackComponentProps>(function DefaultFallback() {
  return <AlertError>{'An unexpected error occurred. Please reload and try again.'}</AlertError>;
});
