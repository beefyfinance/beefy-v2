import { type VaultEntity } from '../../../data/entities/vault';
export type ExplainerProps = {
    vaultId: VaultEntity['id'];
};
export declare const Explainer: (({ vaultId }: ExplainerProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
