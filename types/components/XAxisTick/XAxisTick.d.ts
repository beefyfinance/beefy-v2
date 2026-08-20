import type { TextProps } from 'recharts';
interface Props {
    payload: {
        coordinate: number;
        index: number;
        offset: number;
        value: string;
    };
    tickFormatter?: (value: number | string) => string;
    visibleTicksCount: number;
    index: number;
    x: number;
    width: number;
}
type xAxisTickProps = Props & TextProps;
export declare function XAxisTick({ payload, tickFormatter, visibleTicksCount, index, ...rest }: xAxisTickProps): import("react/jsx-runtime").JSX.Element;
export {};
