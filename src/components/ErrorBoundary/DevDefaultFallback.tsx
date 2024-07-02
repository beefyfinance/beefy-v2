import { memo } from 'react';
import { AlertError } from '../Alerts';
import type { FallbackComponentProps } from './types';

export const DevDefaultFallback = memo<FallbackComponentProps>(function DevDefaultFallback({
  error,
}) {
  return (
    <AlertError>
      <div>An error was thrown from a component</div>
      {error.name && <div>Name: {error.name}</div>}
      {error.message && <div>Message: {error.message}</div>}
      {error.stack && <pre>{error.stack}</pre>}
    </AlertError>
  );
});
