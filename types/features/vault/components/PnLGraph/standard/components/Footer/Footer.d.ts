import type { VaultEntity } from '../../../../../../data/entities/vault';
import { type CssStyles } from '@repo/styles/css';
interface FooterProps {
    period: number;
    handlePeriod: (period: number) => void;
    vaultId: VaultEntity['id'];
    labels: string[];
    css?: CssStyles;
}
export declare const Footer: (({ period, handlePeriod, labels, css: cssProp, }: FooterProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
