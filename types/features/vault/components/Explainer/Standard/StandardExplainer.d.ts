import { type VaultEntity } from '../../../../data/entities/vault';
type StandardExplainerProps = {
    vaultId: VaultEntity['id'];
    underlyingId?: VaultEntity['id'];
};
declare const StandardExplainer: (({ vaultId }: StandardExplainerProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export default StandardExplainer;
