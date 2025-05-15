import type BigNumber from 'bignumber.js';
import type { ChainEntity } from '../../entities/chain.ts';
import type { IAxelarApi } from './axelar-api-types.ts';
import type { AxelarChain, AxelarGasToken } from './axelar-sdk-types.ts';
import { getAxelarSdk } from './sdk.ts';

/** @see https://github.com/axelarnetwork/axelarjs-sdk/blob/main/src/constants/EvmChain.ts */
const chainIdToAxelarChain: Partial<Record<ChainEntity['id'], AxelarChain>> = {
  ethereum: 'ethereum',
  polygon: 'polygon',
  bsc: 'binance',
  optimism: 'optimism',
  fantom: 'fantom',
  arbitrum: 'arbitrum',
  avax: 'avalanche',
  moonbeam: 'moonbeam',
  kava: 'kava',
  zkevm: 'polygon-zkevm',
  base: 'base',
  aurora: 'aurora',
  celo: 'celo',
  linea: 'linea',
  mantle: 'mantle',
  fraxtal: 'fraxtal',
};

/** @see https://github.com/axelarnetwork/axelarjs-sdk/blob/main/src/constants/GasToken.ts */
const axelarChainToGasToken: Record<AxelarChain, AxelarGasToken> = {
  avalanche: 'AVAX',
  moonbeam: 'GLMR',
  polygon: 'MATIC',
  ethereum: 'ETH',
  fantom: 'FTM',
  aurora: 'aETH',
  binance: 'BNB',
  arbitrum: 'ETH',
  celo: 'CELO',
  kava: 'KAVA',
  base: 'ETH',
  filecoin: 'FIL',
  optimism: 'ETH',
  linea: 'ETH',
  'polygon-zkevm': 'ETH',
  mantle: 'MNT',
  scroll: 'ETH',
  fraxtal: 'frxETH',
  blast: 'ETH',
};

export class AxelarApi implements IAxelarApi {
  async estimateGasFee(
    sourceChain: ChainEntity,
    destinationChain: ChainEntity,
    gasLimit: BigNumber,
    sourceAddress: string,
    destinationAddress: string
  ): Promise<BigNumber> {
    const sdk = await getAxelarSdk(destinationChain);
    const source = this.chainEntityToEvmChain(sourceChain);
    const destination = this.chainEntityToEvmChain(destinationChain);
    const sourceGasToken = this.chainEntityToGasToken(source);
    return sdk.estimateGasFee(
      source,
      sourceAddress,
      sourceGasToken,
      destination,
      destinationAddress,
      gasLimit,
      '0x491606584b113024bee25390d17740a2cee6c07cd36882ea70a2ad9026e8fd37050848a5000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000000086f7074696d69736d000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a3078616161364132373966433938623962463934624434373943393044373031343137653336316663320000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000002e56843c42bd166e37fc3f6e94de6d2c0ff7b89c0000000000000000000000000000000000000000000000004f8401842f1da464',
      'auto'
    );
  }

  protected chainEntityToEvmChain(chain: ChainEntity): AxelarChain {
    const maybeEvmChain = chainIdToAxelarChain[chain.id];
    if (maybeEvmChain) {
      return maybeEvmChain;
    }

    throw new Error(`No AxelarChain found for chain id ${chain.id}`);
  }

  protected chainEntityToGasToken(axelarChain: AxelarChain): AxelarGasToken {
    const maybeGasToken = axelarChainToGasToken[axelarChain];
    if (maybeGasToken) {
      return maybeGasToken;
    }

    throw new Error(`No AxelarGasToken found for axelar chain ${axelarChain}`);
  }
}
