import { memo } from 'react';
import type { FallbackComponentProps } from './ErrorBoundary';
import { AlertError } from '../Alerts';

// eslint-disable-next-line no-restricted-syntax
export default memo<FallbackComponentProps>(function DevDefaultFallback({ error }) {
  return (
    <AlertError>
      <div>An error was thrown from a component</div>
      {error.name && <div>Name: {error.name}</div>}
      {error.message && <div>Message: {error.message}</div>}
      {error.stack && <pre>{error.stack}</pre>}
    </AlertError>
  );
});
