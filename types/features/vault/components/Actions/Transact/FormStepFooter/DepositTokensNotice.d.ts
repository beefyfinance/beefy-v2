import type { UnifiedRewardToken } from '../../../../../data/selectors/rewards';
type DepositTokensNoticeProps = {
    i18nKey: string;
    rewardTokens: UnifiedRewardToken[];
    onClick?: () => void;
};
export declare const DepositTokensNotice: (({ i18nKey, rewardTokens, onClick, }: DepositTokensNoticeProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
