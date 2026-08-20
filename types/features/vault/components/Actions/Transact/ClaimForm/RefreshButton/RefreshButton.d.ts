type RefreshButtonProps = {
    title: string;
    text?: string;
    status: 'loading' | 'loaded' | 'error';
    disabled?: boolean;
    onClick?: () => void;
};
export declare const RefreshButton: (({ title, text, status, onClick, disabled, }: RefreshButtonProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
