import { type ErrorInfo, PureComponent } from 'react';
import type { ErrorBoundaryProps, ErrorBoundaryState } from './types';
export declare class ErrorBoundary extends PureComponent<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps);
    static getDerivedStateFromError(e: unknown): ErrorBoundaryState;
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
    render(): string | number | boolean | Iterable<import("react").ReactNode> | import("react/jsx-runtime").JSX.Element | null | undefined;
}
