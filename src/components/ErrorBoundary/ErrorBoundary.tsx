import { miniSerializeError } from '@reduxjs/toolkit';
import { type ErrorInfo, type FC, PureComponent } from 'react';
import { isError } from '../../helpers/error.ts';
import { DefaultFallback } from './DefaultFallback.tsx';
import { DevDefaultFallback } from './DevDefaultFallback.tsx';
import type {
  ErrorBoundaryHasErrorState,
  ErrorBoundaryProps,
  ErrorBoundaryState,
} from './types.ts';

const DefaultFallbackComponent: FC<ErrorBoundaryHasErrorState> =
  import.meta.env.DEV ? DevDefaultFallback : DefaultFallback;

function isReactDevTools(): boolean {
  try {
    type ErrorFnWithDevTools = typeof console.error & {
      __REACT_DEVTOOLS_STRICT_MODE_ORIGINAL_METHOD__?: unknown;
      __REACT_DEVTOOLS_ORIGINAL_METHOD__?: unknown;
    };
    const errorFn = console.error as ErrorFnWithDevTools;

    return (
      !!errorFn.__REACT_DEVTOOLS_ORIGINAL_METHOD__ ||
      !!errorFn.__REACT_DEVTOOLS_STRICT_MODE_ORIGINAL_METHOD__
    );
  } catch {
    return false;
  }
}

export class ErrorBoundary extends PureComponent<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(e: unknown): ErrorBoundaryState {
    if (import.meta.env.DEV) {
      const error = miniSerializeError(e);

      if (isError(e) && e.stack) {
        error.stack = e.stack
          .split('\n')
          .filter(line => !line.includes('/node_modules/') && line.includes(window.location.origin))
          .map(line => line.replace(window.location.origin, '').trim())
          .join('\n');
      }

      return { hasError: true, error };
    }

    return {
      hasError: !!e,
      error: {
        message:
          (!!e &&
            typeof e === 'object' &&
            'message' in e &&
            typeof e.message === 'string' &&
            e.message) ||
          'An unexpected error occurred',
      },
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      if (isReactDevTools()) return;

      const title =
        this.state.hasError ?
          this.state.error.message || this.state.error.name || error.name
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
      console.log(`%c❌❌❌ ErrorBoundary caught an error ⤴️⤴️⤴️`, `background: #4a3535;`);
      console.groupEnd();
    }
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultFallbackComponent;
      return <FallbackComponent {...this.state} />;
    }
    return this.props.children;
  }
}
