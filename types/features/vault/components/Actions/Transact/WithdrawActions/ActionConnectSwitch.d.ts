import { type CssStyles } from '@repo/styles/css';
import { type FC } from 'react';
import { type ActionConnectSwitchProps } from '../CommonActions/CommonActions';
export type ActionConnectSwitchWithFeesProps = ActionConnectSwitchProps & {
    css?: CssStyles;
    FeesComponent?: FC;
};
export declare const ActionConnectSwitchWithFees: (({ children, css: cssProp, chainId, FeesComponent, }: ActionConnectSwitchWithFeesProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
