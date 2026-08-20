import { type VaultEntity } from '../../../../data/entities/vault';
export type LendingOracleProps = {
    vaultId: VaultEntity['id'];
};
export declare const LendingOracle: (({ vaultId }: LendingOracleProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
