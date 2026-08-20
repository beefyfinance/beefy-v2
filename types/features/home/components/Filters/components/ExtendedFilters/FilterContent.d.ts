import type { FilterContent } from '../../../../../data/reducers/filtered-vaults-types';
export interface FilterContentProps {
    handleContent: (content: FilterContent) => void;
}
export declare const Filter: import("react").NamedExoticComponent<FilterContentProps>;
export declare const MobileFilter: import("react").NamedExoticComponent<FilterContentProps>;
export declare const DesktopFilter: import("react").NamedExoticComponent<FilterContentProps>;
