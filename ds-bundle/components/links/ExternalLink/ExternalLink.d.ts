import * as React from 'react';

/**
 * ExternalLink — from beefy-v2@0.1.0.
 */
export interface ExternalLinkProps {
href?: string;
children?: React.ReactNode;
className?: string;
title?: string;
onClick?: React.MouseEventHandler<HTMLAnchorElement>;
/** skip the Farcaster mini-app URL handler and open normally */
bypassMiniApp?: boolean;
}

export declare const ExternalLink: React.ComponentType<ExternalLinkProps>;
