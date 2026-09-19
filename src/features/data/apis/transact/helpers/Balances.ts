import type { TokenAmount } from '../transact-types.ts';
import type BigNumber from 'bignumber.js';
import { BIG_ZERO } from '../../../../../helpers/big-number.ts';
import type { ChainEntity } from '../../../entities/chain.ts';
import type { TokenEntity, TokenErc20 } from '../../../entities/token.ts';
import { isTokenEqual, isTokenNative } from '../../../entities/token.ts';
import { selectChainWrappedNativeToken } from '../../../selectors/tokens.ts';
import type { BeefyState } from '../../../store/types.ts';
import { floorToSharedPrecision, nativeAndWrappedAreSame } from './tokens.ts';

export class Balances {
  protected byAddress: Record<string, BigNumber> = {};
  /** set only where native and wnative are one on-chain balance; the bucket is then the erc20 view */
  protected readonly shared: TokenErc20 | undefined;

  static forChain(
    state: BeefyState,
    chainId: ChainEntity['id'],
    starting: TokenAmount[]
  ): Balances {
    return new Balances(
      starting,
      nativeAndWrappedAreSame(chainId) ? selectChainWrappedNativeToken(state, chainId) : undefined
    );
  }

  constructor(starting: TokenAmount[], sharedWnative?: TokenErc20) {
    this.shared =
      sharedWnative && nativeAndWrappedAreSame(sharedWnative.chainId) ? sharedWnative : undefined;
    this.addMany(starting);
  }

  protected isShared(token: TokenEntity): boolean {
    const shared = this.shared;
    return (
      !!shared &&
      token.chainId === shared.chainId &&
      (isTokenNative(token) || isTokenEqual(token, shared))
    );
  }

  protected keyOf(token: TokenEntity): string {
    return this.isShared(token) ? this.shared!.address : token.address;
  }

  /** the erc20 view truncates, so amounts are floored on the way in and out */
  protected scaled(amount: TokenAmount): BigNumber {
    return this.isShared(amount.token) ?
        floorToSharedPrecision(amount.amount, amount.token, this.shared!)
      : amount.amount;
  }

  public add(amount: TokenAmount): this {
    const key = this.keyOf(amount.token);
    this.byAddress[key] = (this.byAddress[key] || BIG_ZERO).plus(this.scaled(amount));

    if (this.byAddress[key].lt(BIG_ZERO)) {
      throw new Error(`add: Balance of ${amount.token.symbol} is negative`);
    }

    return this;
  }

  public addMany(amounts: TokenAmount[]): this {
    amounts.forEach(amount => this.add(amount));
    return this;
  }

  public subtract(amount: TokenAmount): this {
    const key = this.keyOf(amount.token);
    this.byAddress[key] = (this.byAddress[key] || BIG_ZERO).minus(this.scaled(amount));

    if (this.byAddress[key].lt(BIG_ZERO)) {
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
    return this.byAddress[this.keyOf(token)] || BIG_ZERO;
  }
}
