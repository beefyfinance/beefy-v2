import type { IAxelarApi } from './axelar-types';
import { AxelarQueryAPI, Environment, EvmChain, GasToken } from '@axelar-network/axelarjs-sdk';
import type { ChainEntity } from '../../entities/chain';
import BigNumber from 'bignumber.js';

const chainIdToEvmChain: Record<ChainEntity['id'], EvmChain> = {
  ethereum: EvmChain.ETHEREUM,
  polygon: EvmChain.POLYGON,
  bsc: EvmChain.BINANCE,
  optimism: EvmChain.OPTIMISM,
  fantom: EvmChain.FANTOM,
  arbitrum: EvmChain.ARBITRUM,
  avax: EvmChain.AVALANCHE,
  moonbeam: EvmChain.MOONBEAM,
  kava: EvmChain.KAVA,
  zkevm: EvmChain.POLYGON_ZKEVM,
  base: EvmChain.BASE,
  aurora: EvmChain.AURORA,
  celo: EvmChain.CELO,
};

const chainIdToGasToken: Record<ChainEntity['id'], GasToken> = {
  ethereum: GasToken.ETH,
  polygon: GasToken.MATIC,
  bsc: GasToken.BINANCE,
  optimism: GasToken.ETH,
  fantom: GasToken.FTM,
  arbitrum: GasToken.ETH,
  avax: GasToken.AVAX,
  moonbeam: GasToken.GLMR,
  kava: GasToken.KAVA,
  zkevm: GasToken.ETH,
  base: GasToken.ETH,
  aurora: GasToken.ETH,
  celo: GasToken.CELO,
};

export class AxelarApi implements IAxelarApi {
  private queryApi: AxelarQueryAPI;

  constructor() {
    this.queryApi = new AxelarQueryAPI({ environment: Environment.MAINNET });
  }

  /**
   * @see https://docs.axelar.dev/dev/axelarjs-sdk/axelar-query-api#estimategasfee
   */
  async estimateGasFee(
    sourceChain: ChainEntity,
    destinationChain: ChainEntity,
    gasLimit: BigNumber,
    sourceAddress: string,
    destinationAddress: string
  ): Promise<BigNumber> {
    const source = this.chainEntityToEvmChain(sourceChain);
    const destination = this.chainEntityToEvmChain(destinationChain);
    const sourceGasToken = this.chainEntityToGasToken(sourceChain);
    const estimate = await this.queryApi.estimateGasFee(
      source,
      destination,
      sourceGasToken,
      gasLimit.toString(10),
      1.1,
      '0',
      {
        showDetailedFees: false,
        sourceContractAddress: sourceAddress,
        destinationContractAddress: destinationAddress,
        tokenSymbol: '',
      }
    );

    if (typeof estimate === 'string') {
      // showDetailedFees: false
      return new BigNumber(estimate);
    }

    // showDetailedFees: true
    return new BigNumber(estimate.executionFeeWithMultiplier).plus(estimate.baseFee);
  }

  protected chainEntityToEvmChain(chain: ChainEntity): EvmChain {
    const maybeEvmChain = chainIdToEvmChain[chain.id];
    if (maybeEvmChain) {
      return maybeEvmChain;
    }

    throw new Error(`No Axelar EvmChain found for ${chain.id}`);
  }

  protected chainEntityToGasToken(chain: ChainEntity): GasToken {
    const maybeGasToken = chainIdToGasToken[chain.id];
    if (maybeGasToken) {
      return maybeGasToken;
    }

    throw new Error(`No Axelar GasToken found for ${chain.id}`);
  }
}
