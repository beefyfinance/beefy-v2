import type { GammaHypervisorData, IGammaPool } from '../types';
import type Web3 from 'web3';
import { MultiCall, type ShapeWithLabel } from 'eth-multicall';
import type { ChainEntity } from '../../../entities/chain';
import { getWeb3Instance } from '../../instances';
import type { AmmConfigGamma } from '../../config-types';
import { BigNumber } from 'bignumber.js';
import { createContract, viemToWeb3Abi } from '../../../../../helpers/web3';
import { GammaHypervisorAbi } from '../../../../../config/abi/GammaHypervisorAbi';
import { GammaProxyAbi } from '../../../../../config/abi/GammaProxyAbi';
import { TickMath } from './TickMath';
import type { TokenAmount } from '../../transact/transact-types';
import {
  BIG_ZERO,
  bigNumberToStringDeep,
  fromWei,
  fromWeiString,
  toWei,
  toWeiString,
} from '../../../../../helpers/big-number';
import type { ZapStep, ZapStepRequest, ZapStepResponse } from '../../transact/zap/types';
import { slipAllBy } from '../../transact/helpers/amounts';
import abiCoder from 'web3-eth-abi';
import { getInsertIndex } from '../../transact/helpers/zap';
import { isFulfilledResult } from '../../../../../helpers/promises';
import { onlyOneTokenAmount } from '../../transact/helpers/options';

type HypervisorResponse = {
  currentTick: string;
  totalSupply: string;
  totalAmounts: { 0: string; 1: string };
};

export class GammaPool implements IGammaPool {
  public readonly type = 'gamma';

  protected web3: Web3 | undefined = undefined;
  protected multicall: MultiCall | undefined = undefined;
  protected hypervisorData: GammaHypervisorData | undefined = undefined;

  constructor(
    protected address: string,
    protected amm: AmmConfigGamma,
    protected chain: ChainEntity
  ) {}

  async getWeb3(): Promise<Web3> {
    if (this.web3 === undefined) {
      this.web3 = await getWeb3Instance(this.chain);
    }

    return this.web3;
  }

  async getMulticall(): Promise<MultiCall> {
    if (this.multicall === undefined) {
      this.multicall = new MultiCall(await this.getWeb3(), this.chain.multicallAddress);
    }

    return this.multicall;
  }

  async updateAllData(otherCalls: ShapeWithLabel[][] = []): Promise<unknown[][]> {
    const multicall = await this.getMulticall();
    const calls = [this.getHypervisorRequest(), ...otherCalls];
    const [pairResults, ...otherResults] = await multicall.all(calls);

    this.consumeHypervisorResponse(pairResults);

    return otherResults;
  }

  protected getHypervisorRequest(): ShapeWithLabel[] {
    const contract = createContract(viemToWeb3Abi(GammaHypervisorAbi), this.address);
    return [
      {
        currentTick: contract.methods.currentTick(),
        totalSupply: contract.methods.totalSupply(),
        totalAmounts: contract.methods.getTotalAmounts(),
      },
    ];
  }

  protected consumeHypervisorResponse(untypedResult: unknown[]): void {
    const result = (untypedResult as HypervisorResponse[])[0];
    const currentTick = new BigNumber(result.currentTick);
    const sqrtPrice = TickMath.getSqrtRatioAtTick(currentTick);

    this.hypervisorData = {
      currentTick,
      sqrtPrice,
      priceRatio: sqrtPrice.multipliedBy(sqrtPrice),
      totalSupply: new BigNumber(result.totalSupply),
      totalAmounts: [new BigNumber(result.totalAmounts[0]), new BigNumber(result.totalAmounts[1])],
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

    const multicall = await this.getMulticall();
    const proxy = createContract(viemToWeb3Abi(GammaProxyAbi), this.amm.proxyAddress);
    const [token0, token1] = testAmounts.map(({ token }) => token);
    const [inputToken0Amount, inputToken1Amount] = testAmounts.map(({ amount }) => amount);

    const [
      [
        {
          outputToken0AmountsWei: { 0: outputToken0AmountsMinWei, 1: outputToken0AmountsMaxWei },
          outputToken1AmountsWei: { 0: outputToken1AmountsMinWei, 1: outputToken1AmountsMaxWei },
        },
      ],
    ] = await multicall.all([
      [
        {
          outputToken0AmountsWei: proxy.methods.getDepositAmount(
            this.address,
            token1.address,
            toWeiString(inputToken1Amount, token1.decimals)
          ),
          outputToken1AmountsWei: proxy.methods.getDepositAmount(
            this.address,
            token0.address,
            toWeiString(inputToken0Amount, token0.decimals)
          ),
        },
      ],
    ]);

    const outputToken0Amount = fromWei(
      new BigNumber(outputToken0AmountsMinWei).plus(outputToken0AmountsMaxWei).dividedBy(2),
      token0.decimals
    );
    const outputToken1Amount = fromWei(
      new BigNumber(outputToken1AmountsMinWei).plus(outputToken1AmountsMaxWei).dividedBy(2),
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

    const multicall = await this.getMulticall();
    const proxy = createContract(viemToWeb3Abi(GammaProxyAbi), this.amm.proxyAddress);

    const [
      [
        {
          outputToken0AmountsWei: { 0: outputToken0AmountsMinWei, 1: outputToken0AmountsMaxWei },
          outputToken1AmountsWei: { 0: outputToken1AmountsMinWei, 1: outputToken1AmountsMaxWei },
        },
      ],
    ] = await multicall.all([
      [
        {
          outputToken1AmountsWei: proxy.methods.getDepositAmount(
            this.address,
            inputs[0].token.address,
            toWeiString(inputs[0].amount, inputs[0].token.decimals)
          ),
          outputToken0AmountsWei: proxy.methods.getDepositAmount(
            this.address,
            inputs[1].token.address,
            toWeiString(inputs[1].amount, inputs[1].token.decimals)
          ),
        },
      ],
    ]);

    const neededToken0AmountsForInput1 = {
      min: fromWeiString(outputToken0AmountsMinWei, inputs[0].token.decimals),
      max: fromWeiString(outputToken0AmountsMaxWei, inputs[0].token.decimals),
    };

    const neededToken1AmountsForInput0 = {
      min: fromWeiString(outputToken1AmountsMinWei, inputs[1].token.decimals),
      max: fromWeiString(outputToken1AmountsMaxWei, inputs[1].token.decimals),
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
      data: abiCoder.encodeFunctionCall(
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
        },
        [spender, amountWei.toString(10)]
      ),
      tokens: insertBalance
        ? [
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
      data: abiCoder.encodeFunctionCall(
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
          outputs: [{ type: 'uint256', name: 'shares' }],
        },
        [
          deposit0.toString(10),
          deposit1.toString(10),
          to,
          this.address,
          ['0', '0', '0', '0'], // we are trusting twap checks in proxy->clearance
        ]
      ),
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

    const web3 = await this.getWeb3();
    const hypervisor = new web3.eth.Contract(viemToWeb3Abi(GammaHypervisorAbi), this.address);

    const results = await Promise.allSettled(
      tokenHolders.map(async tokenHolder =>
        hypervisor.methods
          .withdraw(sharesWei.toString(10), tokenHolder, tokenHolder, ['0', '0', '0', '0'])
          .call({ from: tokenHolder })
      )
    );

    const fulfilledResults = results.filter(isFulfilledResult);
    if (fulfilledResults.length === 0) {
      console.error(results);
      throw new Error('No fulfilled results');
    }

    const { amount0, amount1 } = fulfilledResults[0].value;
    return [new BigNumber(amount0), new BigNumber(amount1)];
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
      data: abiCoder.encodeFunctionCall(
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
        },
        [shares.toString(10), from, from, min.map(minAmount => minAmount.toString(10))]
      ),
      tokens: [
        {
          token: this.address,
          index: insertBalance ? getInsertIndex(0) : -1, // shares
        },
      ],
    };
  }
}
