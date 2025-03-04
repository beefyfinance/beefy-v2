import {
  addressBookToAppId,
  getPromosForChain,
  getMintersForChain,
  getVaultsForChain,
} from './config.ts';
import { chainsByAppId } from './chains.ts';
import type { ChainEntity } from '../../src/features/data/entities/chain.ts';
import {
  isTokenErc20,
  isTokenNative,
  type TokenEntity,
  type TokenErc20,
  type TokenNative,
} from '../../src/features/data/entities/token.ts';
import { keyBy, mapValues } from 'lodash-es';
import { getChainAddressBook } from '../../src/features/data/apis/addressbook.ts';

/**
 * Simulates how the app loads tokens
 */

async function getChainTokens(chain: ChainEntity): Promise<TokenEntity[]> {
  return [
    {
      type: 'native',
      id: 'native',
      symbol: chain.native.symbol,
      chainId: chain.id,
      oracleId: chain.native.oracleId,
      address: 'native',
      decimals: chain.native.decimals,
      buyUrl: undefined,
      website: undefined,
      description: undefined,
      documentation: undefined,
    },
    {
      type: 'native',
      id: chain.native.symbol,
      symbol: chain.native.symbol,
      chainId: chain.id,
      oracleId: chain.native.oracleId,
      address: 'native',
      decimals: chain.native.decimals,
      buyUrl: undefined,
      website: undefined,
      description: undefined,
      documentation: undefined,
    },
  ];
}

async function getVaultTokensForChain(chain: ChainEntity): Promise<TokenEntity[]> {
  const vaults = await getVaultsForChain(chain.id);

  return vaults.reduce((tokens: TokenEntity[], vault) => {
    if (vault.tokenAddress) {
      tokens.push({
        type: 'erc20',
        id: vault.token,
        symbol: vault.token,
        chainId: chain.id,
        oracleId: vault.oracleId,
        address: vault.tokenAddress,
        decimals: vault.tokenDecimals,
        providerId: vault.tokenProviderId,
        buyUrl: undefined,
        website: undefined,
        description: undefined,
        documentation: undefined,
        risks: [],
      });
    }

    if (vault.earnedTokenAddress && vault.earnedTokenAddress !== 'native') {
      tokens.push({
        type: 'erc20',
        id: vault.earnedToken,
        symbol: vault.earnedToken,
        chainId: chain.id,
        oracleId: vault.earnedToken,
        address: vault.earnedTokenAddress,
        decimals: vault.earnedTokenDecimals || 18,
        buyUrl: undefined,
        website: undefined,
        description: undefined,
        documentation: undefined,
        risks: [],
      });
    }

    return tokens;
  }, []);
}

async function getBoostTokensForChain(chain: ChainEntity): Promise<TokenEntity[]> {
  const boosts = await getPromosForChain(chain.id);

  return boosts.reduce((tokens: TokenEntity[], boost) => {
    for (const reward of boost.rewards) {
      if (reward.type !== 'token' || !reward.address) continue;

      if (reward.address !== 'native') {
        tokens.push({
          type: 'erc20',
          id: reward.symbol,
          symbol: reward.symbol,
          chainId: reward.chainId || chain.id,
          oracleId: reward.oracleId || reward.symbol,
          address: reward.address,
          decimals: reward.decimals || 18,
          buyUrl: undefined,
          website: undefined,
          description: undefined,
          documentation: undefined,
          risks: [],
        });
      }
    }

    return tokens;
  }, []);
}

async function getMinterTokensForChain(chain: ChainEntity): Promise<TokenEntity[]> {
  const minters = await getMintersForChain(chain.id);

  return minters.reduce((tokens: TokenEntity[], minter) => {
    if (minter.depositToken?.contractAddress && minter.depositToken?.contractAddress !== 'native') {
      tokens.push({
        type: 'erc20',
        id: minter.depositToken.symbol,
        symbol: minter.depositToken.symbol,
        chainId: chain.id,
        oracleId: minter.depositToken.oracleId || minter.depositToken.symbol,
        address: minter.depositToken.contractAddress,
        decimals: minter.depositToken.decimals || 18,
        buyUrl: undefined,
        website: undefined,
        description: undefined,
        documentation: undefined,
        risks: [],
      });
    }

    if (minter.mintedToken?.contractAddress && minter.mintedToken?.contractAddress !== 'native') {
      tokens.push({
        type: 'erc20',
        id: minter.mintedToken.symbol,
        symbol: minter.mintedToken.symbol,
        chainId: chain.id,
        oracleId: minter.mintedToken.oracleId || minter.mintedToken.symbol,
        address: minter.mintedToken.contractAddress,
        decimals: minter.mintedToken.decimals || 18,
        buyUrl: undefined,
        website: undefined,
        description: undefined,
        documentation: undefined,
        risks: [],
      });
    }

    return tokens;
  }, []);
}

type TokensByChainId = {
  [chainId: string]: {
    byId: Record<TokenEntity['id'], TokenEntity['address']>;
    byAddress: Record<TokenEntity['address'], TokenEntity>;
  };
};
const tokensByChainId: TokensByChainId = {};

export async function getTokensForChain(chainId: string): Promise<TokensByChainId['chainId']> {
  const appChainId = addressBookToAppId(chainId);

  if (!tokensByChainId[appChainId]) {
    const chain = chainsByAppId[appChainId];

    // Re-use app logic to turn address book tokens into TokenEntity
    // Simulate app logic for chain/vault/boost/minter
    const [chainTokens, vaultTokens, boostTokens, minterTokens, abTokens] = await Promise.all([
      getChainTokens(chain),
      getVaultTokensForChain(chain),
      getBoostTokensForChain(chain),
      getMinterTokensForChain(chain),
      getChainAddressBook(chain),
    ]);

    const byId: Record<TokenEntity['id'], TokenEntity['address']> = mapValues(
      keyBy(chainTokens, 'id'),
      token => token.address.toLowerCase()
    );
    const byAddress: Record<TokenEntity['address'], TokenEntity> = keyBy(chainTokens, token =>
      token.address.toLowerCase()
    );

    [...vaultTokens, ...boostTokens, ...minterTokens].forEach(token =>
      addToken(token, byId, byAddress)
    );

    for (const [abId, token] of Object.entries(abTokens)) {
      addToken(token, byId, byAddress);
      if (abId === 'WNATIVE' && !byId['wnative']) {
        byId['wnative'] = token.address.toLowerCase();
      }
    }

    tokensByChainId[appChainId] = {
      byId,
      byAddress,
    };
  }

  return tokensByChainId[appChainId];
}

function addToken(
  token: TokenEntity,
  byId: Record<TokenEntity['id'], TokenEntity['address']>,
  byAddress: Record<TokenEntity['address'], TokenEntity>
) {
  // Chain config is source of truth for native tokens
  if (isTokenNative(token)) return;

  const addressLower = token.address.toLowerCase();

  // Map id to address
  if (byId[token.id] === undefined) {
    byId[token.id] = addressLower;
  }

  // Map address to token
  if (byAddress[addressLower] === undefined) {
    byAddress[addressLower] = token;
  }
}

export async function getTokenById(
  id: TokenEntity['id'],
  chainId: ChainEntity['id']
): Promise<TokenEntity | null> {
  const { byId } = await getTokensForChain(chainId);
  const address = byId[id];

  if (!address) return null;

  return getTokenByAddress(address, chainId);
}

export async function getTokenByAddress(
  address: TokenEntity['address'],
  chainId: ChainEntity['id']
): Promise<TokenEntity | null> {
  const { byAddress } = await getTokensForChain(chainId);
  const token = byAddress[address.toLowerCase()];
  return token || null;
}

export async function getNativeToken(chainId: ChainEntity['id']): Promise<TokenNative | null> {
  const token = await getTokenById('native', chainId);
  if (!token || !isTokenNative(token)) {
    throw new Error(`No native token found for chain ${chainId}`);
  }
  return token;
}

export async function getWrappedNativeToken(
  chainId: ChainEntity['id']
): Promise<TokenErc20 | null> {
  const token = await getTokenById('wnative', chainId);
  if (!token || !isTokenErc20(token)) {
    console.warn(token);
    throw new Error(`No wrapped native token found for chain ${chainId}`);
  }

  return token;
}
