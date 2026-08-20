import type { TimeRange } from '../utils';
export type RangeSwitcherProps = {
    availableRanges: TimeRange[];
    range: TimeRange;
    onChange: (newBucket: TimeRange) => void;
};
export declare const RangeSwitcher: (({ availableRanges, range, onChange, }: RangeSwitcherProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
