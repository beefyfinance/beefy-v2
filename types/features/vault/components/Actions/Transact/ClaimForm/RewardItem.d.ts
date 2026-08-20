import type BigNumber from 'bignumber.js';
import type { ChainEntity } from '../../../../../data/entities/chain';
import type { TokenEntity } from '../../../../../data/entities/token';
type Token = Pick<TokenEntity, 'address' | 'symbol' | 'decimals' | 'chainId'>;
export type RewardItemProps = {
    chainId: ChainEntity['id'];
    deposited: boolean;
    reward: {
        active: boolean;
        amount: BigNumber;
        token: Token;
        price: BigNumber | undefined;
        apr: number | undefined;
    };
};
export declare const RewardItem: (({ chainId, reward }: RewardItemProps) => import("react/jsx-runtime").JSX.Element) & {
    displayName?: string;
};
export {};
