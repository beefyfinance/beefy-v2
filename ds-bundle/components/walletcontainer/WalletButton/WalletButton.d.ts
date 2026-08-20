import * as React from 'react';

/**
 * WalletButton — from beefy-v2@0.1.0.
 */
export interface WalletButtonProps {
  initializing: boolean;
  connected: boolean;
  known: boolean;
  error: boolean;
  className?: string;
  id?: string;
  style?: CSSProperties;
  children?: boolean | Iterable<ReactI18NextChild> | React.ReactNode;
}

export declare const WalletButton: React.ComponentType<WalletButtonProps>;
