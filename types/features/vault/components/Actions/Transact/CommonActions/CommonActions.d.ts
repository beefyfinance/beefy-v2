import { type ReactNode } from 'react';
import type { ButtonVariantProps } from '../../../../../../components/Button/styles';
import type { ChainEntity } from '../../../../../data/entities/chain';
type ActionButtonProps = ButtonVariantProps;
export declare const ActionConnect: ((props: ActionButtonProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export type ActionSwitchProps = {
    chainId: ChainEntity['id'];
    buttonText?: string;
} & ActionButtonProps;
export declare const ActionSwitch: (({ chainId, buttonText, ...props }: ActionSwitchProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export type ActionConnectSwitchProps = {
    chainId?: ChainEntity['id'];
    children: ReactNode;
};
export declare const ActionConnectSwitch: (({ children, chainId, }: ActionConnectSwitchProps) => string | number | boolean | Iterable<ReactNode> | import("react/jsx-runtime").JSX.Element | null | undefined) & {
    displayName?: string;
};
export {};
