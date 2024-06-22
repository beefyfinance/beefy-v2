import { type ErrorInfo, type FC, lazy, PureComponent, type ReactNode } from 'react';
import { miniSerializeError, type SerializedError } from '@reduxjs/toolkit';
import { DefaultFallback } from './DefaultFallback';

type ErrorBoundaryNoErrorState = {
  hasError: false;
};

type ErrorBoundaryHasErrorState = {
  hasError: true;
  error: SerializedError;
};

type ErrorBoundaryState = ErrorBoundaryNoErrorState | ErrorBoundaryHasErrorState;

export type FallbackComponentProps = ErrorBoundaryHasErrorState;

export type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: FC<ErrorBoundaryHasErrorState>;
};

const DefaultFallbackComponent: FC<ErrorBoundaryHasErrorState> = import.meta.env.DEV
  ? lazy(() => import('./DevDefaultFallback'))
  : DefaultFallback;

function isReactDevTools(): boolean {
  type ErrorFnWithDevTools = typeof console.error & {
    __REACT_DEVTOOLS_STRICT_MODE_ORIGINAL_METHOD__?: unknown | undefined;
    __REACT_DEVTOOLS_ORIGINAL_METHOD__?: unknown | undefined;
  };
  const errorFn = console.error as ErrorFnWithDevTools;

  return (
    !!errorFn.__REACT_DEVTOOLS_ORIGINAL_METHOD__ ||
    !!errorFn.__REACT_DEVTOOLS_STRICT_MODE_ORIGINAL_METHOD__
  );
}

export class ErrorBoundary extends PureComponent<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(e: unknown): ErrorBoundaryState {
    const error = miniSerializeError(e);

    if (e instanceof Error && e.stack) {
      error.stack = e.stack
        .split('\n')
        .filter(line => !line.includes('/node_modules/') && line.includes(window.location.origin))
        .map(line => line.replace(window.location.origin, '').trim())
        .join('\n');
    }

    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (isReactDevTools()) return;

    const title = this.state.hasError
      ? this.state.error.message || this.state.error.name || error.name
      : error.name;

    console.group(`%c❌❌❌ ErrorBoundary caught an error ⤵️⤵️⤵️`, `background: #4a3535;`);
    console.log(title);
    if (error.stack) {
      console.groupCollapsed('%cErrorStack ->', `background: #4a3535;`);
      console.log(error.stack);
      console.groupEnd();
    }
    if (errorInfo.componentStack) {
      console.groupCollapsed('%cComponentStack ->', `background: #4a3535;`);
      console.log(errorInfo.componentStack);
      console.groupEnd();
    }
    console.log(`%c❌❌❌ ErrorBoundary caught an error ⤴️⤴️⤴️`, `backrround: #4a3535;`);
    console.groupEnd();
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultFallbackComponent;
      return <FallbackComponent {...this.state} />;
    }
    return this.props.children;
  }
}
