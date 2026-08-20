import type BigNumber from 'bignumber.js';
import type { ChainEntity } from '../../../../data/entities/chain';
type ChainProps = {
    chainId: ChainEntity['id'];
    tvl: BigNumber;
};
export declare const Chain: import("react").NamedExoticComponent<ChainProps>;
export {};
