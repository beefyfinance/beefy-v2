import { omit } from 'lodash-es';
import { addressBookToAppId, getVaultsForChain } from './common/config.ts';
import { saveJson } from './common/files.ts';
import { allChainIds, type AppChainId } from './common/chains.ts';
import { sortVaultKeys } from './common/vault-fields.ts';
import type { VaultConfig } from '../src/features/data/apis/config-types.ts';
import { getTokenById } from './common/tokens.ts';
import { type TokenEntity } from '../src/features/data/entities/token.ts';
import { type CurveApiPoolWithMetadata, getCurvePools } from './zaps/curve.ts';
import { mapValuesAsync } from './common/utils.ts';
import { type ChainEntity } from '../src/features/data/entities/chain.ts';
import { entries } from '../src/helpers/object.ts';

const WARN_MISSING_ASSET_ON_ACTIVE_VAULTS_ONLY: boolean = true;

type ChainProviderUrls = {
  [chain in AppChainId]?: {
    [tokenProviderId: string]: ProviderUrls | ProviderConfigWithCondition[];
  };
};

type UrlFunction = (vault: VaultConfig, key: keyof ProviderUrls) => Promise<string>;

type ProviderUrls = {
  buyTokenUrl?: string | UrlFunction;
  addLiquidityUrl?: string | UrlFunction;
  removeLiquidityUrl?: string | UrlFunction;
};

type ProviderConfigWithCondition = ProviderUrls & {
  condition: (vault: VaultConfig) => boolean;
};

// TODO rest of chains/providers
/**
 * {lp} - LP token address
 * {tokenN} - n-th address from vault assets[]; 'native' is replaced by native token symbol for that chain
 * {tokenN:wrapped} - n-th address from vault assets[]; 'native' is replaced by wrapped native token address for that chain
 * Adding :lower to any of the above will lowercase the result (e.g. {token0:lower})
 */
const URLS: ChainProviderUrls = {
  arbitrum: {
    curve: {
      buyTokenUrl: curvePoolUrl,
      addLiquidityUrl: curvePoolUrl,
      removeLiquidityUrl: curvePoolUrl,
    },
  },
  avax: {
    curve: {
      buyTokenUrl: curvePoolUrl,
      addLiquidityUrl: curvePoolUrl,
      removeLiquidityUrl: curvePoolUrl,
    },
  },
  base: {
    curve: {
      buyTokenUrl: curvePoolUrl,
      addLiquidityUrl: curvePoolUrl,
      removeLiquidityUrl: curvePoolUrl,
    },
  },
  bsc: {
    pancakeswap: [
      {
        condition: (vault: VaultConfig) => vault.id.startsWith('cakev2-'),
        buyTokenUrl:
          'https://pancakeswap.finance/swap?inputCurrency={token0}&outputCurrency={token1}',
        addLiquidityUrl: 'https://pancakeswap.finance/v2/add/{token0}/{token1}',
        removeLiquidityUrl: 'https://pancakeswap.finance/v2/remove/{token0}/{token1}',
      },
    ],
  },
  celo: {
    curve: {
      buyTokenUrl: curvePoolUrl,
      addLiquidityUrl: curvePoolUrl,
      removeLiquidityUrl: curvePoolUrl,
    },
  },
  ethereum: {
    curve: {
      buyTokenUrl: curvePoolUrl,
      addLiquidityUrl: curvePoolUrl,
      removeLiquidityUrl: curvePoolUrl,
    },
  },
  fantom: {
    wigoswap: {
      addLiquidityUrl: 'https://wigoswap.io/add/{token0}/{token1}',
      removeLiquidityUrl: 'https://wigoswap.io/remove/{token0}/{token1}',
    },
    equalizer: {
      addLiquidityUrl: 'https://equalizer.exchange/liquidity/{lp}',
      removeLiquidityUrl: 'https://equalizer.exchange/liquidity/{lp}',
    },
    spiritswap: [
      {
        condition: (vault: VaultConfig) => vault.id.startsWith('spiritV2-'),
        buyTokenUrl: 'https://www.spiritswap.finance/swap/{token0}/{token1}',
        addLiquidityUrl: 'https://www.spiritswap.finance/liquidity/{token0}/{token1}',
        removeLiquidityUrl: 'https://www.spiritswap.finance/liquidity/{token0}/{token1}',
      },
    ],
    curve: {
      buyTokenUrl: curvePoolUrl,
      addLiquidityUrl: curvePoolUrl,
      removeLiquidityUrl: curvePoolUrl,
    },
  },
  kava: {
    curve: {
      buyTokenUrl: curvePoolUrl,
      addLiquidityUrl: curvePoolUrl,
      removeLiquidityUrl: curvePoolUrl,
    },
  },
  moonbeam: {
    curve: {
      buyTokenUrl: curvePoolUrl,
      addLiquidityUrl: curvePoolUrl,
      removeLiquidityUrl: curvePoolUrl,
    },
  },
  optimism: {
    velodrome: [
      {
        condition: (vault: VaultConfig) =>
          vault.id.startsWith('velodrome-') && !vault.id.startsWith('velodrome-v2-'),
        buyTokenUrl: 'https://velodrome.finance/swap?from={token0}&to={token1}',
        addLiquidityUrl: 'https://v1.velodrome.finance/liquidity/manage?address={lp}',
        removeLiquidityUrl: 'https://v1.velodrome.finance/liquidity/manage?address={lp}',
      },
      {
        condition: (vault: VaultConfig) =>
          vault.id.startsWith('velodrome-v2-') && vault.token.includes(' sLP'),
        buyTokenUrl:
          'https://velodrome.finance/swap?from={token0:wrapped:lower}&to={token1:wrapped:lower}',
        addLiquidityUrl:
          'https://velodrome.finance/deposit?token0={token0:wrapped}&token1={token1:wrapped}&type=0',
        removeLiquidityUrl: 'https://velodrome.finance/withdraw?pool={lp}',
      },
      {
        condition: (vault: VaultConfig) =>
          vault.id.startsWith('velodrome-v2-') && vault.token.includes(' vLP'),
        buyTokenUrl:
          'https://velodrome.finance/swap?from={token0:wrapped:lower}&to={token1:wrapped:lower}',
        addLiquidityUrl:
          'https://velodrome.finance/deposit?token0={token0:wrapped}&token1={token1:wrapped}&type=-1',
        removeLiquidityUrl: 'https://velodrome.finance/withdraw?pool={lp}',
      },
    ],
    curve: {
      buyTokenUrl: curvePoolUrl,
      addLiquidityUrl: curvePoolUrl,
      removeLiquidityUrl: curvePoolUrl,
    },
  },
  polygon: {
    curve: {
      buyTokenUrl: curvePoolUrl,
      addLiquidityUrl: curvePoolUrl,
      removeLiquidityUrl: curvePoolUrl,
    },
  },
};

const curveEndpoints: Record<string, number> = {
  main: 0,
  crypto: 1,
  factory: 2,
  'factory-tricrypto': 3,
  'factory-stable-ng': 4,
  'factory-crvusd': 5,
  'factory-eywa': 6,
  'factory-crypto': 7,
};

const curveUrlKeys: Record<string, keyof CurveApiPoolWithMetadata['poolUrls']> = {
  buyTokenUrl: 'swap',
  addLiquidityUrl: 'deposit',
  removeLiquidityUrl: 'withdraw',
};

async function curvePoolUrl(vault: VaultConfig, key: keyof ProviderUrls) {
  const allPools = await getCurvePools(vault.network, false, true);
  const pools = allPools.filter(pool => pool.lpTokenAddress === vault.tokenAddress);

  if (pools.length) {
    pools.sort(
      (a, b) =>
        (curveEndpoints[a.metadata.endpoint] || 100) - (curveEndpoints[b.metadata.endpoint] || 100)
    );
    return pools[0].poolUrls[curveUrlKeys[key]][0];
  }

  console.log(`Could not find curve pool for ${vault.id} on ${vault.network}`);
  return vault[key]!;
}

async function replaceUrlsForVault(
  vault: VaultConfig,
  addresses: Record<string, string>
): Promise<ProviderUrls | undefined> {
  if (!vault.tokenProviderId) {
    return undefined;
  }

  const chainId = addressBookToAppId(vault.network);
  const urlsForProvider = URLS[chainId]?.[vault.tokenProviderId];
  if (!urlsForProvider) {
    return undefined;
  }

  let urlsForVault: ProviderUrls | undefined;
  if (Array.isArray(urlsForProvider)) {
    const found = urlsForProvider.find(x => x.condition(vault));
    if (found) {
      urlsForVault = omit(found, 'condition');
    }
  } else {
    urlsForVault = urlsForProvider;
  }

  if (!urlsForVault) {
    return undefined;
  }

  return mapValuesAsync(
    urlsForVault,
    async (url, urlKey) => {
      if (!url) {
        throw new Error(`Missing url for ${vault.id} on ${vault.network}`);
      }

      if (typeof url === 'function') {
        url = await url(vault, urlKey);
      }

      if (typeof url === 'string') {
        const replaced = Object.entries(addresses).reduce((acc, [key, value]) => {
          return acc.replace(`{${key}}`, value);
        }, url);

        if (replaced.includes('{')) {
          throw new Error(`Missing replacement in ${replaced}`);
        }

        return replaced;
      }

      return undefined;
    },
    true
  );
}

async function getUrlsForVault(
  vault: VaultConfig,
  wnative: TokenEntity
): Promise<ProviderUrls | undefined> {
  if (vault.tokenAddress && vault.tokenProviderId) {
    const replacements: Record<string, string> = {
      lp: vault.tokenAddress,
      'lp:lower': vault.tokenAddress.toLowerCase(),
    };

    if (vault.assets) {
      for (let i = 0; i < vault.assets.length; ++i) {
        const asset = vault.assets[i];
        const token = await getTokenById(asset, vault.network as ChainEntity['id']);

        if (!token) {
          if (!WARN_MISSING_ASSET_ON_ACTIVE_VAULTS_ONLY || vault.status === 'active') {
            console.error(
              `Could not find token id ${asset} for vault ${vault.id} on ${vault.network}. Did you forget to update addressbook?`
            );
          }
          return undefined;
        }

        replacements[`token${i}`] = token.address === 'native' ? token.symbol : token.address;
        replacements[`token${i}:wrapped`] =
          token.address === 'native' ? wnative.address : token.address;
        replacements[`token${i}:lower`] = replacements[`token${i}`].toLowerCase();
        replacements[`token${i}:wrapped:lower`] = replacements[`token${i}:wrapped`].toLowerCase();
      }
    }

    return await replaceUrlsForVault(vault, replacements);
  }

  return undefined;
}

async function getModifiedConfig(chainId: AppChainId) {
  const vaults = await getVaultsForChain(chainId);
  const wnative = await getTokenById('wnative', chainId);
  if (!wnative) {
    throw new Error(`Missing wnative for ${chainId}`);
  }

  return Promise.all(
    vaults.map(async vault => {
      if (vault.tokenAddress && vault.tokenProviderId) {
        const urls = await getUrlsForVault(vault, wnative);
        if (urls) {
          for (const [key, url] of entries(urls)) {
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
    const chainId = allChainIds[i];
    if (URLS[chainId]?.['curve']) {
      await getCurvePools(chainId, false, false);
    }
    await saveJson(`./src/config/vault/${chainId}.json`, modified[i], 'prettier');
  }
}

start().catch(e => {
  console.error(e);
  process.exit(1);
});
