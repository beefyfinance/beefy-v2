import { type AnchorHTMLAttributes } from 'react';
export type ExternalLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'target' | 'rel'> & {
    bypassMiniApp?: boolean;
};
export declare const ExternalLink: (props: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "target" | "rel"> & {
    bypassMiniApp?: boolean;
} & import("react").RefAttributes<HTMLAnchorElement>) => import("react").ReactElement | null;
