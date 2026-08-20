import type { PathPattern } from 'react-router';
export type RedirectType = {
    from: string | string[] | PathPattern<string>;
    to: string;
};
export declare const REDIRECTS: RedirectType[];
