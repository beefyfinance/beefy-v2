import type { VaultEntity } from '../../../../../data/entities/vault';
type ScreamAvailableLiquidityProps = {
    vaultId: VaultEntity['id'];
    onChange: (isLocked: boolean) => void;
};
export declare const ScreamAvailableLiquidityNotice: (({ vaultId, onChange, }: ScreamAvailableLiquidityProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
export {};
