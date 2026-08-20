import type { VaultEntity } from '../../../../../data/entities/vault';
import type { GlpLikeConfig } from './types';
export type GlpWithdrawNoticeImplProps = {
    vaultId: VaultEntity['id'];
    config: GlpLikeConfig;
    onChange: (isLocked: boolean) => void;
};
export declare const GlpWithdrawNoticeImpl: (({ vaultId, config, onChange, }: GlpWithdrawNoticeImplProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
