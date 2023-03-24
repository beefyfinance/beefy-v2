import { getVaultsForChain } from './common/config';
import { saveJson } from './common/utils';
import { allChainIds, AppChainId } from './common/chains';
import { sortVaultKeys } from './common/vault-fields';
import { mapValues } from 'lodash';
import { VaultConfig } from '../src/features/data/apis/config-types';
import { getTokenById } from './common/tokens';

const WARN_MISSING_ASSET_ON_ACTIVE_VAULTS_ONLY: boolean = true;

type ChainProviderUrls = {
  [chain in AppChainId]?: {
    [tokenProviderId: string]: ProviderUrls;
  };
};

type ProviderUrls = {
  addLiquidityUrl?: string;
  removeLiquidityUrl?: string;
};

// TODO rest of chains/providers
/**
 * {lp} - LP token address
 * {tokenN} - n-th address from vault assets[]; 'native' is replaced by native token symbol for that chain
 */
const URLS: ChainProviderUrls = {
  fantom: {
    equalizer: {
      addLiquidityUrl: 'https://equalizer.exchange/liquidity/{lp}',
      removeLiquidityUrl: 'https://equalizer.exchange/liquidity/{lp}',
    },
    wigoswap: {
      addLiquidityUrl: 'https://wigoswap.io/add/{token0}/{token1}',
      removeLiquidityUrl: 'https://wigoswap.io/remove/{token0}/{token1}',
    },
  },
};

function getUrlsForTokenProvider(
  chainId: AppChainId,
  tokenProviderId: string,
  addresses: Record<string, string>
): ProviderUrls | undefined {
  const urls = URLS[chainId]?.[tokenProviderId];
  if (urls) {
    return mapValues(urls, url => {
      const replaced = Object.entries(addresses).reduce((acc, [key, value]) => {
        return acc.replace(`{${key}}`, value);
      }, url);

      if (replaced.includes('{')) {
        throw new Error(`Missing replacement in ${replaced}`);
      }

      return replaced;
    });
  }

  return undefined;
}

async function getUrlsForVault(vault: VaultConfig): Promise<ProviderUrls | undefined> {
  if (vault.tokenAddress && vault.tokenProviderId) {
    const replacements = {
      lp: vault.tokenAddress,
    };

    for (const i in vault.assets) {
      const asset = vault.assets[i];
      const token = await getTokenById(asset, vault.network);

      if (!token) {
        if (!WARN_MISSING_ASSET_ON_ACTIVE_VAULTS_ONLY || vault.status === 'active') {
          console.error(
            `Could not find token id ${asset} for vault ${vault.id} on ${vault.network}. Did you forget to update addressbook?`
          );
        }
        return undefined;
      }

      replacements[`token${i}`] = token.address === 'native' ? token.symbol : token.address;
    }

    return getUrlsForTokenProvider(vault.network, vault.tokenProviderId, replacements);
  }

  return undefined;
}

async function getModifiedConfig(chainId: AppChainId) {
  const vaults = await getVaultsForChain(chainId);

  return Promise.all(
    vaults.map(async vault => {
      if (vault.tokenAddress && vault.tokenProviderId) {
        const urls = await getUrlsForVault(vault);
        if (urls) {
          for (const [key, url] of Object.entries(urls)) {
            if (vault[key] !== url) {
              console.log(`Setting ${key} in vault ${vault.id} on ${vault.network}...`);
              vault = { ...vault, [key]: url };
            }
          }
        }
      }

      return sortVaultKeys(vault);
    })
  );
}

async function start() {
  const modified = await Promise.all(allChainIds.map(getModifiedConfig));

  for (let i = 0; i < allChainIds.length; i++) {
    await saveJson(`./src/config/vault/${allChainIds[i]}.json`, modified[i], true);
  }
}

start().catch(e => {
  console.error(e);
  process.exit(1);
});
