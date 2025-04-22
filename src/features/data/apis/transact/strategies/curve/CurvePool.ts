import { type CurveTokenOption, getMethodSignaturesForType } from './types.ts';
import { getInsertIndex, getTokenAddress } from '../../helpers/zap.ts';
import type BigNumber from 'bignumber.js';
import type { TokenAmount } from '../../transact-types.ts';
import { fromWei, toWeiString } from '../../../../../../helpers/big-number.ts';
import type { ChainEntity } from '../../../../entities/chain.ts';
import { isTokenNative, type TokenEntity } from '../../../../entities/token.ts';
import type { ZapStep } from '../../zap/types.ts';
import { fetchContract } from '../../../rpc-contract/viem-contract.ts';
import { encodeFunctionData, type Abi, type Address } from 'viem';

export class CurvePool {
  public constructor(
    protected readonly option: CurveTokenOption,
    protected readonly poolAddress: string,
    protected readonly chain: ChainEntity,
    protected readonly depositToken: TokenEntity
  ) {}

  /** calc_token_amount */
  public async quoteAddLiquidity(depositAmount: BigNumber): Promise<TokenAmount> {
    const contract = fetchContract(
      this.option.target as Address,
      this.typeToAddLiquidityQuoteAbi(this.option.type, this.option.numCoins),
      this.chain.id
    );

    const amounts = this.makeAmounts(
      toWeiString(depositAmount, this.option.token.decimals),
      this.option.index,
      this.option.numCoins
    );

    const params = this.typeToAddLiquidityQuoteParams(
      this.option.type,
      this.poolAddress,
      amounts.map(amount => BigInt(amount))
    );
    console.log(this.option.type, this.option.target, 'calc_token_amount', params);

    const amount = (await contract.read.calc_token_amount([...params])) as bigint;
    console.log('->', amount);

    return {
      token: this.depositToken,
      amount: fromWei(amount.toString(10), this.depositToken.decimals),
    };
  }

  /** calc_token_amount abi */
  protected typeToAddLiquidityQuoteAbi(type: CurveTokenOption['type'], numCoins: number): Abi {
    const signatures = getMethodSignaturesForType(type);
    return this.signatureToAbiItem(signatures.depositQuote, numCoins);
  }

  /** calc_token_amount params */
  protected typeToAddLiquidityQuoteParams(
    type: CurveTokenOption['type'],
    poolAddress: string,
    amounts: bigint[]
  ): unknown[] {
    switch (type) {
      case 'fixed':
        return [amounts];
      case 'fixed-deposit-int128':
      case 'fixed-deposit-uint256':
      case 'dynamic-deposit':
      case 'fixed-deposit-underlying':
        return [amounts, true];
      case 'pool-fixed':
        return [poolAddress, amounts];
      case 'pool-fixed-deposit':
      case 'pool-dynamic-deposit':
        return [poolAddress, amounts, true];
      default:
        throw new Error(`Invalid deposit type ${type}`);
    }
  }

  /** add_liquidity */
  public buildZapAddLiquidityTx(
    depositAmountWei: BigNumber,
    minLiquidityWei: BigNumber,
    insertBalance: boolean
  ): ZapStep {
    const amountsWei = this.makeAmounts(
      depositAmountWei.toString(10),
      this.option.index,
      this.option.numCoins
    );
    const tokenIndexes = this.typeToAddLiquidityTokenIndexes(this.option.type, amountsWei);
    const isNative = isTokenNative(this.option.token);

    const methodAbi = this.typeToAddLiquidityAbi(this.option.type, this.option.numCoins);
    const methodParams = this.typeToAddLiquidityParams(
      this.option.type,
      this.poolAddress,
      amountsWei,
      minLiquidityWei.toString(10)
    );

    return {
      target: this.option.target,
      value: isNative ? depositAmountWei.toString(10) : '0',
      data: encodeFunctionData({
        abi: methodAbi,
        args: methodParams,
      }),
      tokens:
        insertBalance ?
          [
            {
              token: getTokenAddress(this.option.token),
              index: tokenIndexes[this.option.index],
            },
          ]
        : [],
    };
  }

  /** add_liquidity indexes */
  protected typeToAddLiquidityTokenIndexes(
    type: CurveTokenOption['type'],
    amounts: string[]
  ): number[] {
    switch (type) {
      case 'fixed':
      case 'fixed-deposit-int128':
      case 'fixed-deposit-uint256':
      case 'fixed-deposit-underlying':
        // amounts[N_COINS] is first param, so array index N is at offset N
        return amounts.map((_, i) => getInsertIndex(i));
      case 'dynamic-deposit':
        // amounts[] is first param, but its dynamic array
        // 0   offset to array
        // 1   min_amount
        // 2   array length
        // 3   array 0
        // 4   array 1
        // N+3 array N
        return amounts.map((_, i) => getInsertIndex(3 + i));
      case 'pool-fixed':
      case 'pool-fixed-deposit':
        // amounts[N_COINS] is second param, so array index N is at offset N+1
        return amounts.map((_, i) => getInsertIndex(1 + i));
      case 'pool-dynamic-deposit':
        // amounts[] is 2nd param, but its dynamic array
        // 0   pool address
        // 1   offset to array
        // 2   min_amount
        // 3   array length
        // 4   array 0
        // 5   array 1
        // N+4 array N
        return amounts.map((_, i) => getInsertIndex(4 + i));
      default:
        throw new Error(`Invalid deposit type ${type}`);
    }
  }

  /** add_liquidity abi */
  protected typeToAddLiquidityAbi(type: CurveTokenOption['type'], numCoins: number): Abi {
    const signatures = getMethodSignaturesForType(type);
    return this.signatureToAbiItem(signatures.deposit, numCoins, 'payable');
  }

  /** add_liquidity params */
  protected typeToAddLiquidityParams(
    type: CurveTokenOption['type'],
    poolAddress: string,
    amounts: string[],
    minMintAmount: string
  ): unknown[] {
    switch (type) {
      case 'fixed':
      case 'fixed-deposit-int128':
      case 'fixed-deposit-uint256':
      case 'dynamic-deposit':
        return [amounts, minMintAmount];
      case 'fixed-deposit-underlying':
        return [amounts, minMintAmount, true];
      case 'pool-fixed':
      case 'pool-fixed-deposit':
      case 'pool-dynamic-deposit':
        return [poolAddress, amounts, minMintAmount];
      default:
        throw new Error(`Invalid deposit type ${type}`);
    }
  }

  /** calc_withdraw_one_coin */
  public async quoteRemoveLiquidity(withdrawAmount: BigNumber): Promise<TokenAmount> {
    const contract = fetchContract(
      this.option.target,
      this.typeToRemoveLiquidityQuoteAbi(this.option.type, this.option.numCoins),
      this.chain.id
    );
    const amount = toWeiString(withdrawAmount, this.depositToken.decimals);
    const params = this.typeToRemoveLiquidityQuoteParams(
      this.option.type,
      this.poolAddress,
      BigInt(amount),
      this.option.index
    );
    console.log(this.option.type, this.option.target, 'calc_withdraw_one_coin', params);
    const withdrawn = (await contract.read.calc_withdraw_one_coin(params)) as bigint;
    console.log('->', withdrawn);

    return {
      token: this.option.token,
      amount: fromWei(withdrawn.toString(10), this.option.token.decimals),
    };
  }

  /** calc_withdraw_one_coin abi */
  protected typeToRemoveLiquidityQuoteAbi(type: CurveTokenOption['type'], numCoins: number): Abi {
    const signatures = getMethodSignaturesForType(type);
    return this.signatureToAbiItem(signatures.withdrawQuote, numCoins);
  }

  /** calc_withdraw_one_coin params */
  protected typeToRemoveLiquidityQuoteParams(
    type: CurveTokenOption['type'],
    poolAddress: string,
    amount: bigint,
    tokenIndex: number
  ): unknown[] {
    switch (type) {
      case 'fixed':
      case 'fixed-deposit-int128':
      case 'fixed-deposit-uint256':
      case 'dynamic-deposit':
      case 'fixed-deposit-underlying':
        return [amount, tokenIndex];
      case 'pool-fixed':
      case 'pool-fixed-deposit':
      case 'pool-dynamic-deposit':
        return [poolAddress, amount, tokenIndex];
      default:
        throw new Error(`Invalid withdraw type ${type}`);
    }
  }

  /** remove_liquidity_one_coin */
  public buildZapRemoveLiquidityTx(
    withdrawAmountWei: BigNumber,
    minOutputWei: BigNumber,
    insertBalance: boolean
  ): ZapStep {
    const methodAbi = this.typeToRemoveLiquidityAbi(this.option.type, this.option.numCoins);
    const methodParams = this.typeToRemoveLiquidityParams(
      this.option.type,
      this.poolAddress,
      withdrawAmountWei.toString(10),
      this.option.index,
      minOutputWei.toString(10)
    );

    return {
      target: this.option.target,
      value: '0',
      data: encodeFunctionData({
        abi: methodAbi,
        args: methodParams,
      }),
      tokens:
        insertBalance ?
          [
            {
              token: this.depositToken.address,
              index: this.typeToRemoveLiquidityTokenIndex(this.option.type),
            },
          ]
        : [],
    };
  }

  /** remove_liquidity_one_coin token indexes */
  protected typeToRemoveLiquidityTokenIndex(type: CurveTokenOption['type']): number {
    switch (type) {
      case 'fixed':
      case 'fixed-deposit-int128':
      case 'fixed-deposit-uint256':
      case 'dynamic-deposit':
      case 'fixed-deposit-underlying':
        // 0: amount
        // 1: index
        // 2: min_amount
        // [3: use_underlying]
        return getInsertIndex(0);
      case 'pool-fixed':
      case 'pool-fixed-deposit':
      case 'pool-dynamic-deposit':
        // 0: pool
        // 1: amount
        // 2: index
        // 3: min_amount
        return getInsertIndex(1);
      default:
        throw new Error(`Invalid withdraw type ${type}`);
    }
  }

  /** remove_liquidity_one_coin abi */
  protected typeToRemoveLiquidityAbi(type: CurveTokenOption['type'], numCoins: number): Abi {
    const signatures = getMethodSignaturesForType(type);
    return this.signatureToAbiItem(signatures.withdraw, numCoins, 'payable');
  }

  /** remove_liquidity_one_coin params */
  protected typeToRemoveLiquidityParams(
    type: CurveTokenOption['type'],
    poolAddress: string,
    amount: string,
    tokenIndex: number,
    minAmount: string
  ): unknown[] {
    switch (type) {
      case 'fixed':
      case 'fixed-deposit-int128':
      case 'fixed-deposit-uint256':
      case 'dynamic-deposit':
        return [amount, tokenIndex, minAmount];
      case 'fixed-deposit-underlying':
        return [amount, tokenIndex, minAmount, true];
      case 'pool-fixed':
      case 'pool-fixed-deposit':
      case 'pool-dynamic-deposit':
        return [poolAddress, amount, tokenIndex, minAmount];
      default:
        throw new Error(`Invalid withdraw type ${type}`);
    }
  }

  protected makeAmounts(amount: string, index: number, numCoins: number): string[] {
    const amounts = Array<string>(numCoins).fill('0');
    amounts[index] = amount;
    return amounts;
  }

  protected signatureToAbiItem(
    signature: string,
    numCoins: number,
    stateMutability: 'payable' | 'view' = 'view'
  ): Abi {
    const [name, inputsPart] = signature.split(':');
    const inputs = inputsPart.split('/');

    return [
      {
        type: 'function',
        name,
        stateMutability,
        inputs: inputs.map(input => {
          switch (input) {
            case 'fixed_amounts':
              return {
                name: 'amounts',
                type: `uint256[${numCoins}]`,
              };
            case 'dynamic_amounts':
              return {
                name: 'amounts',
                type: `uint256[]`,
              };
            case 'amount':
            case 'min_amount':
              return {
                name: input,
                type: 'uint256',
              };
            case 'uint256_index':
              return {
                name: 'index',
                type: 'uint256',
              };
            case 'int128_index':
              return {
                name: 'index',
                type: 'int128',
              };
            case 'is_deposit':
            case 'use_underlying':
              return {
                name: input,
                type: 'bool',
              };
            case 'pool':
              return {
                name: input,
                type: 'address',
              };
            default:
              throw new Error(`Invalid input type ${input}`);
          }
        }),
        outputs: [
          {
            name: 'amount',
            type: 'uint256',
          },
        ],
      },
    ];
  }
}
