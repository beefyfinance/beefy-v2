import type { GammaHypervisorData, IGammaPool } from '../types.ts';
import type { ChainEntity } from '../../../entities/chain.ts';
import type { AmmConfigGamma } from '../../config-types.ts';
import BigNumber from 'bignumber.js';
import { GammaHypervisorAbi } from '../../../../../config/abi/GammaHypervisorAbi.ts';
import { GammaProxyAbi } from '../../../../../config/abi/GammaProxyAbi.ts';
import { TickMath } from './TickMath.ts';
import type { TokenAmount } from '../../transact/transact-types.ts';
import {
  BIG_ZERO,
  bigNumberToBigInt,
  bigNumberToStringDeep,
  fromWei,
  toWei,
  toWeiString,
} from '../../../../../helpers/big-number.ts';
import type { ZapStep, ZapStepRequest, ZapStepResponse } from '../../transact/zap/types.ts';
import { slipAllBy } from '../../transact/helpers/amounts.ts';
import { getInsertIndex } from '../../transact/helpers/zap.ts';
import { isFulfilledResult } from '../../../../../helpers/promises.ts';
import { onlyOneTokenAmount } from '../../transact/helpers/options.ts';
import { encodeFunctionData, type Abi, type Address } from 'viem';
import { fetchContract } from '../../rpc-contract/viem-contract.ts';

export class GammaPool implements IGammaPool {
  public readonly type = 'gamma';

  protected hypervisorData: GammaHypervisorData | undefined = undefined;

  constructor(
    protected address: string,
    protected amm: AmmConfigGamma,
    protected chain: ChainEntity
  ) {}

  async updateAllData() {
    const hypervisorContract = fetchContract(this.address, GammaHypervisorAbi, this.chain.id);
    const [currentTick, totalSupply, totalAmounts] = await Promise.all([
      hypervisorContract.read.currentTick(),
      hypervisorContract.read.totalSupply(),
      hypervisorContract.read.getTotalAmounts(),
    ]);

    const sqrtPrice = TickMath.getSqrtRatioAtTick(new BigNumber(currentTick));

    this.hypervisorData = {
      currentTick: new BigNumber(currentTick),
      sqrtPrice,
      priceRatio: sqrtPrice.multipliedBy(sqrtPrice),
      totalSupply: new BigNumber(totalSupply.toString(10)),
      totalAmounts: [
        new BigNumber(totalAmounts[0].toString(10)),
        new BigNumber(totalAmounts[1].toString(10)),
      ],
    };
  }

  public getHypervisorData(): GammaHypervisorData {
    if (!this.hypervisorData) {
      throw new Error('Hypervisor data is not loaded');
    }

    return { ...this.hypervisorData, totalAmounts: [...this.hypervisorData.totalAmounts] };
  }

  public async getAddLiquidityRatio(testAmounts: TokenAmount[]): Promise<BigNumber> {
    if (!this.hypervisorData) {
      throw new Error('Hypervisor data is not loaded');
    }

    const proxyContract = fetchContract(this.amm.proxyAddress, GammaProxyAbi, this.chain.id);
    const [token0, token1] = testAmounts.map(({ token }) => token);
    const [inputToken0Amount, inputToken1Amount] = testAmounts.map(({ amount }) => amount);

    const [
      [outputToken0AmountsMinWei, outputToken0AmountsMaxWei],
      [outputToken1AmountsMinWei, outputToken1AmountsMaxWei],
    ] = await Promise.all([
      proxyContract.read.getDepositAmount([
        this.address as Address,
        token1.address as Address,
        BigInt(toWeiString(inputToken1Amount, token1.decimals)),
      ]),
      proxyContract.read.getDepositAmount([
        this.address as Address,
        token0.address as Address,
        BigInt(toWeiString(inputToken0Amount, token0.decimals)),
      ]),
    ]);

    const outputToken0Amount = fromWei(
      new BigNumber(outputToken0AmountsMinWei.toString(10))
        .plus(outputToken0AmountsMaxWei.toString(10))
        .dividedBy(2),
      token0.decimals
    );
    const outputToken1Amount = fromWei(
      new BigNumber(outputToken1AmountsMinWei.toString(10))
        .plus(outputToken1AmountsMaxWei.toString(10))
        .dividedBy(2),
      token1.decimals
    );
    const { priceRatio } = this.hypervisorData;
    const priceRatioDecimal = priceRatio.shiftedBy(token0.decimals).shiftedBy(-token1.decimals);
    const outputToken0AmountInToken1 = outputToken0Amount.times(priceRatioDecimal);
    const outputToken1AmountInToken0 = outputToken1Amount.dividedBy(priceRatioDecimal);
    const swapRatio0 = inputToken0Amount.dividedBy(
      outputToken1AmountInToken0.plus(inputToken0Amount)
    );
    const swapRatio1 = outputToken0AmountInToken1.dividedBy(
      inputToken1Amount.plus(outputToken0AmountInToken1)
    );

    return BigNumber.sum(swapRatio0, swapRatio1).dividedBy(2);
  }

  public async getOptimalAddLiquidity(inputs: TokenAmount[]): Promise<TokenAmount[]> {
    if (!this.hypervisorData) {
      throw new Error('Hypervisor data is not loaded');
    }

    const proxyContract = fetchContract(this.amm.proxyAddress, GammaProxyAbi, this.chain.id);
    const [
      [outputToken0AmountsMinWei, outputToken0AmountsMaxWei],
      [outputToken1AmountsMinWei, outputToken1AmountsMaxWei],
    ] = await Promise.all([
      proxyContract.read.getDepositAmount([
        this.address as Address,
        inputs[1].token.address as Address,
        BigInt(toWeiString(inputs[1].amount, inputs[1].token.decimals)),
      ]),
      proxyContract.read.getDepositAmount([
        this.address as Address,
        inputs[0].token.address as Address,
        BigInt(toWeiString(inputs[0].amount, inputs[0].token.decimals)),
      ]),
    ]);

    const neededToken0AmountsForInput1 = {
      min: fromWei(outputToken0AmountsMinWei.toString(10), inputs[0].token.decimals),
      max: fromWei(outputToken0AmountsMaxWei.toString(10), inputs[0].token.decimals),
    };

    const neededToken1AmountsForInput0 = {
      min: fromWei(outputToken1AmountsMinWei.toString(10), inputs[1].token.decimals),
      max: fromWei(outputToken1AmountsMaxWei.toString(10), inputs[1].token.decimals),
    };

    // inputs are within range, we can use as-is
    if (
      inputs[0].amount.gte(neededToken0AmountsForInput1.min) &&
      inputs[0].amount.lte(neededToken0AmountsForInput1.max) &&
      inputs[1].amount.gte(neededToken1AmountsForInput0.min) &&
      inputs[1].amount.lte(neededToken1AmountsForInput0.max)
    ) {
      return inputs;
    }

    console.debug(
      bigNumberToStringDeep({
        inputs,
        neededToken0AmountsForInput1,
        neededToken1AmountsForInput0,
      })
    );

    if (inputs[0].amount.gte(neededToken0AmountsForInput1.max)) {
      return [
        {
          token: inputs[0].token,
          amount: neededToken0AmountsForInput1.min
            .plus(neededToken0AmountsForInput1.max)
            .dividedBy(2)
            .decimalPlaces(inputs[0].token.decimals, BigNumber.ROUND_FLOOR),
        },
        inputs[1],
      ];
    }

    if (inputs[1].amount.gte(neededToken1AmountsForInput0.max)) {
      return [
        inputs[0],
        {
          token: inputs[1].token,
          amount: neededToken1AmountsForInput0.min
            .plus(neededToken1AmountsForInput0.max)
            .dividedBy(2)
            .decimalPlaces(inputs[1].token.decimals, BigNumber.ROUND_FLOOR),
        },
      ];
    }

    throw new Error('getOptimalAddLiquidity: not enough input');
  }

  public async getZapAddLiquidity(request: ZapStepRequest): Promise<ZapStepResponse> {
    const { inputs, outputs, maxSlippage, zapRouter, insertBalance } = request;
    if (inputs.length !== 2) {
      throw new Error('Invalid inputs');
    }

    return {
      inputs,
      outputs,
      minOutputs: slipAllBy(outputs, maxSlippage),
      returned: [],
      zaps: [
        this.buildTokenApproveTx(
          inputs[0].token.address,
          this.address,
          toWei(inputs[0].amount, inputs[0].token.decimals),
          insertBalance
        ),
        this.buildTokenApproveTx(
          inputs[1].token.address,
          this.address,
          toWei(inputs[1].amount, inputs[1].token.decimals),
          insertBalance
        ),
        this.buildZapAddLiquidityTx(
          inputs[0].token.address,
          inputs[1].token.address,
          toWei(inputs[0].amount, inputs[0].token.decimals),
          toWei(inputs[1].amount, inputs[1].token.decimals),
          zapRouter,
          insertBalance
        ),
      ],
    };
  }

  /**
   * @dev setting insertBalance to true has the side effect of approving the token to spend itself
   */
  protected buildTokenApproveTx(
    token: string,
    spender: string,
    amountWei: BigNumber,
    insertBalance: boolean = false
  ): ZapStep {
    return {
      target: token,
      value: '0',
      data: encodeFunctionData({
        abi: [
          {
            type: 'function',
            name: 'approve',
            constant: false,
            payable: false,
            inputs: [
              { type: 'address', name: 'spender' },
              {
                type: 'uint256',
                name: 'amount',
              },
            ],
            outputs: [{ type: 'bool', name: 'success' }],
            stateMutability: 'nonpayable',
          },
        ] as const satisfies Abi,
        args: [spender as Address, bigNumberToBigInt(amountWei)],
      }),
      tokens:
        insertBalance ?
          [
            {
              token,
              index: getInsertIndex(1), // this has side effect of approving the token to spend itself
            },
          ]
        : [],
    };
  }

  protected buildZapAddLiquidityTx(
    token0: string,
    token1: string,
    deposit0: BigNumber,
    deposit1: BigNumber,
    to: string,
    insertBalance: boolean
  ): ZapStep {
    return {
      target: this.amm.proxyAddress,
      value: '0',
      data: encodeFunctionData({
        abi: [
          {
            type: 'function',
            name: 'deposit',
            constant: false,
            payable: false,
            inputs: [
              { type: 'uint256', name: 'deposit0' },
              {
                type: 'uint256',
                name: 'deposit1',
              },
              { type: 'address', name: 'to' },
              { type: 'address', name: 'pos' },
              {
                type: 'uint256[4]',
                name: 'minIn',
              },
            ],
            stateMutability: 'nonpayable',
            outputs: [{ type: 'uint256', name: 'shares' }],
          },
        ] as const satisfies Abi,
        args: [
          bigNumberToBigInt(deposit0),
          bigNumberToBigInt(deposit1),
          to as Address,
          this.address as Address,
          [0n, 0n, 0n, 0n],
        ],
      }),
      tokens: [
        {
          token: token0,
          index: insertBalance ? getInsertIndex(0) : -1, // deposit0
        },
        {
          token: token1,
          index: insertBalance ? getInsertIndex(1) : -1, // deposit1
        },
      ],
    };
  }

  public async quoteRemoveLiquidity(
    sharesWei: BigNumber,
    tokenHolders: [string, ...string[]]
  ): Promise<BigNumber[]> {
    if (!this.hypervisorData) {
      throw new Error('Hypervisor data is not loaded');
    }

    const hypervisorContract = fetchContract(this.address, GammaHypervisorAbi, this.chain.id);
    const results = await Promise.allSettled(
      tokenHolders.map(tokenHolder =>
        hypervisorContract.simulate.withdraw(
          [
            bigNumberToBigInt(sharesWei),
            tokenHolder as Address,
            tokenHolder as Address,
            [0n, 0n, 0n, 0n],
          ],
          {
            account: tokenHolder as Address,
          }
        )
      )
    );

    const fulfilledResults = results.filter(isFulfilledResult);
    if (fulfilledResults.length === 0) {
      console.error(results);
      throw new Error('No fulfilled results');
    }

    const [amount0, amount1] = fulfilledResults[0].value.result;
    return [new BigNumber(amount0.toString(10)), new BigNumber(amount1.toString(10))];
  }

  public async getZapRemoveLiquidity(request: ZapStepRequest): Promise<ZapStepResponse> {
    const { inputs, outputs, zapRouter, insertBalance, maxSlippage } = request;

    const input = onlyOneTokenAmount(inputs);
    if (this.address.toLowerCase() !== input.token.address.toLowerCase()) {
      throw new Error('Invalid input token');
    }

    if (outputs.length !== 2) {
      throw new Error('Invalid output count');
    }

    return {
      inputs,
      outputs,
      minOutputs: slipAllBy(outputs, maxSlippage),
      returned: [],
      zaps: [
        this.buildZapRemoveLiquidityTx(
          toWei(input.amount, input.token.decimals),
          zapRouter,
          [BIG_ZERO, BIG_ZERO, BIG_ZERO, BIG_ZERO],
          insertBalance
        ),
      ],
    };
  }

  protected buildZapRemoveLiquidityTx(
    shares: BigNumber,
    from: string,
    min: [BigNumber, BigNumber, BigNumber, BigNumber],
    insertBalance: boolean
  ): ZapStep {
    return {
      target: this.address,
      value: '0',
      data: encodeFunctionData({
        abi: [
          {
            type: 'function',
            name: 'withdraw',
            constant: false,
            payable: false,
            inputs: [
              { type: 'uint256', name: 'shares' },
              { type: 'address', name: 'to' },
              {
                type: 'address',
                name: 'from',
              },
              { type: 'uint256[4]', name: 'minAmounts' },
            ],
            outputs: [
              { type: 'uint256', name: 'amount0' },
              { type: 'uint256', name: 'amount1' },
            ],
            stateMutability: 'nonpayable',
          },
        ] as const satisfies Abi,
        args: [
          bigNumberToBigInt(shares),
          from as Address,
          from as Address,
          min.map(bigNumberToBigInt) as [bigint, bigint, bigint, bigint], // It's length 4
        ],
      }),
      tokens: [
        {
          token: this.address,
          index: insertBalance ? getInsertIndex(0) : -1, // shares
        },
      ],
    };
  }
}
