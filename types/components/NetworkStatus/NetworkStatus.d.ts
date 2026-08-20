import { type RefObject } from 'react';
type NetworkStatusProps = {
    positionRef: RefObject<HTMLDivElement>;
    isOpen: boolean;
    haveUnreadNotification: boolean;
    setOpen: (open: boolean) => void;
};
export declare const NetworkStatus: (({ positionRef, isOpen: isUserOpen, setOpen, haveUnreadNotification, }: NetworkStatusProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
