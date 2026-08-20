import type { PromoReward } from '../../../../../data/entities/promo';
import type { VaultEntity } from '../../../../../data/entities/vault';
export type BoostDepositNoticeProps = {
    vaultId: VaultEntity['id'];
    rewardTokens: PromoReward[];
};
declare const BoostDepositNotice: (({ vaultId, rewardTokens, }: BoostDepositNoticeProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export default BoostDepositNotice;
