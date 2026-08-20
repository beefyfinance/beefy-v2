import type { TokenAmount } from '../transact-types';
import type BigNumber from 'bignumber.js';
import type { TokenEntity } from '../../../entities/token';
export declare class Balances {
    protected byAddress: Record<string, BigNumber>;
    constructor(starting: TokenAmount[]);
    add(amount: TokenAmount): this;
    addMany(amounts: TokenAmount[]): this;
    subtract(amount: TokenAmount): this;
    subtractMany(amounts: TokenAmount[]): this;
    isNonZero(token: TokenEntity): boolean;
    get(token: TokenEntity): BigNumber;
}
