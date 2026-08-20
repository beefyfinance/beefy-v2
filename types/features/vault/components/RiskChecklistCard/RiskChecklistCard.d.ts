import type { VaultEntity } from '../../../data/entities/vault';
type RiskChecklistProps = {
    vaultId: VaultEntity['id'];
};
declare function RiskChecklist({ vaultId }: RiskChecklistProps): import("react/jsx-runtime").JSX.Element;
export declare const RiskChecklistCard: typeof RiskChecklist & {
    displayName?: string;
};
export {};
