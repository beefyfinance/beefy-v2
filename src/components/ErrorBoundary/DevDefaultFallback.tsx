import { memo } from 'react';
import { AlertError } from '../Alerts/Alerts.tsx';
import type { FallbackComponentProps } from './types.ts';

export const DevDefaultFallback = memo(function DevDefaultFallback({
  error,
}: FallbackComponentProps) {
  return (
    <AlertError>
      <div>An error was thrown from a component</div>
      {error.name && <div>Name: {error.name}</div>}
      {error.message && <div>Message: {error.message}</div>}
      {error.stack && <pre>{error.stack}</pre>}
    </AlertError>
  );
});
