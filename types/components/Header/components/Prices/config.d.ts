import type { ChainEntity } from '../../../../features/data/entities/chain';
export type Token = {
    symbol: string;
    address: string;
    oracleId: string;
    chainId: ChainEntity['id'];
    icon: string;
    explorer: {
        name: string;
        icon: string;
        url: string;
    };
    walletIconUrl: string;
    buyLink?: {
        url: string;
        platform: 'llama' | 'shadow';
    };
};
export declare const tokens: Token[];
