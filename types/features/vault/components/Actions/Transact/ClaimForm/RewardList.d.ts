import type { ChainEntity } from '../../../../../data/entities/chain';
import { type RewardItemProps } from './RewardItem';
type RewardListProps = {
    chainId: ChainEntity['id'];
    deposited: boolean;
    rewards: Array<RewardItemProps['reward']>;
};
export declare const RewardList: (({ rewards, deposited, chainId, }: RewardListProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
