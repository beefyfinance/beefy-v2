import type { IAxelarApi } from './axelar-types';
import { AxelarQueryAPI, Environment, EvmChain, GasToken } from '@axelar-network/axelarjs-sdk';
import type { ChainEntity } from '../../entities/chain';
import BigNumber from 'bignumber.js';

const chainIdToEvmChain: Partial<Record<ChainEntity['id'], EvmChain>> = {
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

const chainIdToGasToken: Partial<Record<ChainEntity['id'], GasToken>> = {
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
      gasLimit.toString(10),
      1.1,
      sourceGasToken,
      '0',
      '0x491606584b113024bee25390d17740a2cee6c07cd36882ea70a2ad9026e8fd37050848a5000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000000086f7074696d69736d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a3078616161364132373966433938623962463934624434373943393044373031343137653336316663320000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000002e56843c42bd166e37fc3f6e94de6d2c0ff7b89c0000000000000000000000000000000000000000000000004f8401842f1da464',
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
