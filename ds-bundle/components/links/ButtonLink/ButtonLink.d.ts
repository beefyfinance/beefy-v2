import * as React from 'react';

/**
 * ButtonLink — from beefy-v2@0.1.0.
 */
export interface ButtonLinkProps {
  onClick: () => void;
  children?: React.ReactNode;
  className?: string;
}

export declare const ButtonLink: React.ComponentType<ButtonLinkProps>;
