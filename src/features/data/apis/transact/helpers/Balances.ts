import type { TokenAmount } from '../transact-types.ts';
import type BigNumber from 'bignumber.js';
import { BIG_ZERO } from '../../../../../helpers/big-number.ts';
import type { TokenEntity } from '../../../entities/token.ts';

export class Balances {
  protected byAddress: Record<string, BigNumber> = {};

  constructor(starting: TokenAmount[]) {
    this.addMany(starting);
  }

  public add(amount: TokenAmount): this {
    this.byAddress[amount.token.address] = (this.byAddress[amount.token.address] || BIG_ZERO).plus(
      amount.amount
    );

    if (this.byAddress[amount.token.address].lt(BIG_ZERO)) {
      throw new Error(`add: Balance of ${amount.token.symbol} is negative`);
    }

    return this;
  }

  public addMany(amounts: TokenAmount[]): this {
    amounts.forEach(amount => this.add(amount));
    return this;
  }

  public subtract(amount: TokenAmount): this {
    this.byAddress[amount.token.address] = (this.byAddress[amount.token.address] || BIG_ZERO).minus(
      amount.amount
    );

    if (this.byAddress[amount.token.address].lt(BIG_ZERO)) {
      throw new Error(`subtract: Balance of ${amount.token.symbol} is negative`);
    }

    return this;
  }

  public subtractMany(amounts: TokenAmount[]): this {
    amounts.forEach(amount => this.subtract(amount));
    return this;
  }

  public isNonZero(token: TokenEntity): boolean {
    return this.get(token).gt(BIG_ZERO);
  }

  public get(token: TokenEntity): BigNumber {
    return this.byAddress[token.address] || BIG_ZERO;
  }
}
