import type { LoaderNotifications } from '../../features/data/selectors/data-loader-helpers';
type HeaderProps = {
    notifications: LoaderNotifications;
    isMobile?: boolean;
};
export declare const Header: (({ notifications, isMobile }: HeaderProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
