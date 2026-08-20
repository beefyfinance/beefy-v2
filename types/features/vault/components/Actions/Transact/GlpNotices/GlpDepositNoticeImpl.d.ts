import type { VaultEntity } from '../../../../../data/entities/vault';
import type { GlpLikeConfig } from './types';
export type GlpDepositNoticeImplProps = {
    vaultId: VaultEntity['id'];
    config: GlpLikeConfig;
    onChange: (isLocked: boolean) => void;
};
export declare const GlpDepositNoticeImpl: (({ vaultId, config, onChange, }: GlpDepositNoticeImplProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
