import type { VaultEntity } from '../../../../../data/entities/vault';
type GlpDepositNoticeProps = {
    vaultId: VaultEntity['id'];
    onChange: (isLocked: boolean) => void;
};
export declare const GlpDepositNotice: (({ vaultId, onChange, }: GlpDepositNoticeProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
type GlpWithdrawNoticeProps = {
    vaultId: VaultEntity['id'];
    onChange: (isLocked: boolean) => void;
};
export declare const GlpWithdrawNotice: (({ vaultId, onChange, }: GlpWithdrawNoticeProps) => import("react/jsx-runtime").JSX.Element | null) & {
    displayName?: string;
};
export {};
