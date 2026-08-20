import { type CssStyles } from '@repo/styles/css';
import { type ReactNode } from 'react';
import type { ChainEntity } from '../../../../data/entities/chain';
type ActionButtonProps = {
    css?: CssStyles;
    disabled?: boolean;
};
export type ActionConnectProps = ActionButtonProps;
export declare const ActionConnect: (({ css: cssProp, disabled, }: ActionConnectProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export type ActionSwitchProps = {
    chainId: ChainEntity['id'];
} & ActionButtonProps;
export declare const ActionSwitch: (({ chainId, css: cssProp, disabled, }: ActionSwitchProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export type ActionConnectSwitchProps = ActionButtonProps & {
    chainId?: ChainEntity['id'];
    children: ReactNode;
};
export declare const ActionConnectSwitch: (({ children, css: cssProp, chainId, disabled, }: ActionConnectSwitchProps) => string | number | boolean | Iterable<ReactNode> | import("react/jsx-runtime").JSX.Element | null | undefined) & {
    displayName?: string;
};
export {};
