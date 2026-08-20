import type { BuildVersion } from '../../features/data/reducers/ui-version-types';
declare global {
    interface Window {
        __beefyHandleNewVersion?: (currentVersion: BuildVersion, newVersion: BuildVersion, reloadFailed: boolean, newVersionMessage: string) => Promise<boolean>;
    }
}
export declare const AppVersionCheck: (() => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
