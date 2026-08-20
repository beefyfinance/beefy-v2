import { type CssStyles } from '@repo/styles/css';
import type { VaultEntity } from '../../../../../../data/entities/vault';
interface CommonFooterProps {
    period: number;
    handlePeriod: (period: number) => void;
    labels: string[];
    css?: CssStyles;
}
interface OverviewFooterProps extends CommonFooterProps {
    position: boolean;
}
export declare const OverviewFooter: (({ period, handlePeriod, labels, css: cssProp, position, }: OverviewFooterProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
type FooterProps = CommonFooterProps & {
    vaultId: VaultEntity['id'];
};
export declare const FeesFooter: (({ period, handlePeriod, labels, vaultId, css: cssProp, }: FooterProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
