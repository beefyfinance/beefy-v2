import type { SerializedError } from '@reduxjs/toolkit';
import type { FC, ReactNode } from 'react';

export type ErrorBoundaryNoErrorState = {
  hasError: false;
};

export type ErrorBoundaryHasErrorState = {
  hasError: true;
  error: SerializedError;
};

export type ErrorBoundaryState = ErrorBoundaryNoErrorState | ErrorBoundaryHasErrorState;

export type FallbackComponentProps = ErrorBoundaryHasErrorState;

export type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: FC<ErrorBoundaryHasErrorState>;
};
