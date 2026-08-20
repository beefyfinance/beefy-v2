import type BigNumber from 'bignumber.js';
import type { BoostRewardContractData } from '../../../../data/apis/contract-data/contract-data-types';
export type Reward = BoostRewardContractData & {
    pending: BigNumber;
    active: boolean;
    apr: number;
};
export type RewardsProps = {
    isInBoost: boolean;
    rewards: Reward[];
};
export declare const Rewards: (({ isInBoost, rewards }: RewardsProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
