import type { BeefyState } from '../../../data/store/types';
import { type PulseHighlightProps } from '../PulseHighlight/PulseHighlight';
import type { TabOption, TabProps } from './CardHeaderTabs';
type HighlightFn = (state: BeefyState) => PulseHighlightProps['variant'] | false | undefined | null;
type HighlightableContext = {
    shouldHighlight?: HighlightFn;
};
export type HighlightableTabOption<TValue extends string = string> = TabOption<TValue, HighlightableContext>;
type HighlightableTabProps<TValue extends string = string> = TabProps<TValue, HighlightableContext>;
export declare const HighlightableTab: (<TValue extends string = string>({ value, label, onChange, selected, context, }: HighlightableTabProps<TValue>) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
