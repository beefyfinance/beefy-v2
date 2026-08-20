import { type VaultEntity } from '../../../../data/entities/vault';
type Erc4626ExplainerProps = {
    vaultId: VaultEntity['id'];
};
declare const Erc4626Explainer: (({ vaultId }: Erc4626ExplainerProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export default Erc4626Explainer;
