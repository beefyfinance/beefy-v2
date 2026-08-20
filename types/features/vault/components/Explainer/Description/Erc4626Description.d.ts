import { type VaultEntity } from '../../../../data/entities/vault';
export type Erc4626DescriptionProps = {
    vaultId: VaultEntity['id'];
};
export declare const Erc4626Description: (({ vaultId, }: Erc4626DescriptionProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
