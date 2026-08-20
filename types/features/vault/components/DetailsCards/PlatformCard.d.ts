import type { PlatformEntity } from '../../../data/entities/platform';
declare function PlatformCardComponent({ platformId }: {
    platformId: PlatformEntity['id'];
}): import("react/jsx-runtime").JSX.Element;
export declare const PlatformCard: typeof PlatformCardComponent & {
    displayName?: string;
};
export {};
