export declare function useCollapse(openByDefault?: boolean): {
    open: boolean;
    handleToggle: () => void;
    Icon: import("react").FunctionComponent<import("react").SVGProps<SVGSVGElement> & {
        title?: string;
        titleId?: string;
        desc?: string;
        descId?: string;
    }>;
};
