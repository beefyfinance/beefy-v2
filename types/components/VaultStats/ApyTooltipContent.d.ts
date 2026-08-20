import type { VaultEntity } from '../../features/data/entities/vault';
import { type FormattedAvgApy, type FormattedTotalApy } from '../../helpers/format';
type AverageApyTooltipContentProps = {
    vaultId: VaultEntity['id'];
    averages: FormattedAvgApy;
    totalType: 'apy' | 'apr';
    header?: boolean;
};
export declare const AverageApyTooltipContent: (({ vaultId, averages, header, totalType, }: AverageApyTooltipContentProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
type ApyTooltipContentProps = {
    vaultId: VaultEntity['id'];
    type: 'yearly' | 'daily';
    isBoosted: boolean;
    rates: FormattedTotalApy;
    averages?: FormattedAvgApy;
};
export declare const ApyTooltipContent: (({ vaultId, type, isBoosted, rates, averages, }: ApyTooltipContentProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
