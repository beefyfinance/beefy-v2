import type { ReactNode } from 'react';
import { type ContainerProps } from '../Container/Container';
interface SectionHeaderProps {
    title?: string;
    subTitle?: string;
}
export declare const SectionHeader: (({ title, subTitle }: SectionHeaderProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
interface SectionProps {
    title?: string;
    subTitle?: string;
    children: ReactNode;
    maxWidth?: ContainerProps['maxWidth'];
    noPadding?: ContainerProps['noPadding'];
}
export declare const Section: (({ title, subTitle, children, maxWidth, noPadding, }: SectionProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
