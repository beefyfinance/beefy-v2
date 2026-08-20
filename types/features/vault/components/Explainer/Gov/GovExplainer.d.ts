import type { VaultGov } from '../../../../data/entities/vault';
type GovExplainerProps = {
    vaultId: VaultGov['id'];
};
declare const GovExplainer: (({ vaultId }: GovExplainerProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export default GovExplainer;
