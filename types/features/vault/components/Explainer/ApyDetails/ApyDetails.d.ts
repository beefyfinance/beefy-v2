import { type CssStyles } from '@repo/styles/css';
import { type ApyLabelsType } from '../../../../../helpers/apy';
import type { TotalApy } from '../../../../data/reducers/apy-types';
export type ApyDetailsProps = {
    values: TotalApy;
    type: ApyLabelsType;
    css?: CssStyles;
};
export declare const ApyDetails: (({ values, type, css: cssProp, }: ApyDetailsProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
