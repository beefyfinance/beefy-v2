import { AddressBookChainId, appToAddressBookId } from '../../../common/config';
import { OptionalRecord } from '../../utils/types';
import { EtherscanBlockExplorer } from './etherscan';
import { createCachedFactory } from '../../utils/factory';
import { pConsole } from '../../utils/console';
import { createRateLimitedFetchJson } from '../../utils/http/rate-limit';

const etherscanChains: OptionalRecord<AddressBookChainId, string> = {
  ethereum: 'https://api.etherscan.io/api',
  polygon: 'https://api.polygonscan.com/api',
  bsc: 'https://api.bscscan.com/api',
  optimism: 'https://api-optimistic.etherscan.io/api',
  fantom: 'https://api.ftmscan.com/api',
  arbitrum: 'https://api.arbiscan.io/api',
  avax: 'https://api.routescan.io/v2/network/mainnet/evm/43114/etherscan/api',
};

export const getBlockExplorerForChain = createCachedFactory(
  (chainId: string) => {
    const abChainId = appToAddressBookId(chainId);

    const etherscanUrl = etherscanChains[abChainId];
    if (etherscanUrl) {
      const envKey = `ETHERSCAN_API_KEY_${abChainId.toUpperCase()}`;
      const apiKey = process.env[envKey] || 'YourApiKeyToken';
      let rps = 5; // 5 per 1 second
      if (apiKey === 'YourApiKey') {
        rps = 1 / 6; // 1 per 6 seconds
        pConsole.warn(`No etherscan API key provided: ${envKey}`);
      }
      const http = createRateLimitedFetchJson({
        autoStart: true,
        concurrency: 1,
        intervalCap: rps < 1 ? 1 : rps,
        interval: rps < 1 ? (1 / rps) * 1000 : 1000,
      });
      return new EtherscanBlockExplorer(etherscanUrl, apiKey, http);
    }

    throw new Error(`No block explorer defined for chain ${chainId}`);
  },
  chainId => chainId
);
