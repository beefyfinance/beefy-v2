import { type VaultEntity } from '../../../../data/entities/vault';
export type StandardDescriptionProps = {
    vaultId: VaultEntity['id'];
};
export declare const StandardDescription: (({ vaultId, }: StandardDescriptionProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
