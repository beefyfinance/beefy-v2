import type { UnifiedRewardToken } from '../../../../../data/selectors/rewards';
export type DepositClaimNoticeProps = {
    rewardTokens: UnifiedRewardToken[];
};
declare const DepositClaimNotice: (({ rewardTokens, }: DepositClaimNoticeProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export default DepositClaimNotice;
