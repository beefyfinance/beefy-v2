import { type VaultEntity } from '../../../../data/entities/vault';
export type GovDescriptionProps = {
    vaultId: VaultEntity['id'];
};
export declare const GovDescription: (({ vaultId }: GovDescriptionProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
