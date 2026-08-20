import { type ReactNode } from 'react';
import { type FormatTimeUntilOptions } from '../../helpers/date';
export type CountdownProps = {
    time: Date;
    renderFuture?: (formatted: string) => ReactNode;
    renderPast?: ReactNode | (() => ReactNode);
} & FormatTimeUntilOptions;
export declare const Countdown: (({ time, renderFuture, renderPast, ...timeUntilOptions }: CountdownProps) => string | number | boolean | Iterable<ReactNode> | import("react/jsx-runtime").JSX.Element | null | undefined) & {
    displayName?: string;
};
export type TimeUntilProps = {
    time?: Date;
} & Omit<CountdownProps, 'time'>;
export declare const TimeUntil: (({ time, ...rest }: TimeUntilProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
