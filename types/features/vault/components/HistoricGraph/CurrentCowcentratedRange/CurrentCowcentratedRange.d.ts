import type { CurrentCowcentratedRangeData } from '../../../../data/entities/token';
import type { VaultEntity } from '../../../../data/entities/vault';
type CurrentCowcentratedRangeIfAvailableProps = {
    vaultId: VaultEntity['id'];
    inverted: boolean;
    toggleInverted: () => void;
};
export declare const CurrentCowcentratedRangeIfAvailable: (({ vaultId, inverted, toggleInverted, }: CurrentCowcentratedRangeIfAvailableProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
type CurrentCowcentratedRangeProps = {
    vaultId: VaultEntity['id'];
    range: CurrentCowcentratedRangeData;
    inverted: boolean;
    toggleInverted: () => void;
};
export declare const CurrentCowcentratedRange: (({ vaultId, range, inverted, toggleInverted, }: CurrentCowcentratedRangeProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
