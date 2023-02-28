import { ChainEntity } from '../src/features/data/entities/chain';
import { config } from '../src/config/config';
import { getAmmsForChain, getVaultsForChain } from './common/config';
import { AmmConfig, VaultConfig } from '../src/features/data/apis/config-types';
import { groupBy } from 'lodash';
import { getNativeToken, getTokenById, getWrappedNativeToken } from './common/tokens';
import { TokenEntity } from '../src/features/data/entities/token';
import { computeUniswapV2PairAddress } from '../src/features/data/apis/transact/helpers/uniswapv2';
import { computeSolidlyPairAddress } from '../src/features/data/apis/transact/helpers/solidly';
import { saveJson, sortKeys } from './common/utils';

const WARN_MISSING_ASSET_ON_ACTIVE_VAULTS_ONLY: boolean = true;
const FIELD_ORDER = [
  'id',
  'name',
  'token',
  'tokenAddress',
  'tokenDecimals',
  'tokenProviderId',
  'tokenAmmId',
  'earnedToken',
  'earnedTokenAddress',
  'earnedTokenDecimals',
  'earnContractAddress',
  'oracle',
  'oracleId',
  'status',
  'retireReason',
  'pauseReason',
  'platformId',
  'assets',
  'risks',
  'strategyTypeId',
  'isGovVault',
  'excluded',
  'depositFee',
  'buyTokenUrl',
  'addLiquidityUrl',
  'removeLiquidityUrl',
  'refund',
  'refundContractAddress',
  'showWarning',
  'warning',
  'network',
  'createdAt',
].reduce((fields: {}, field, i) => {
  fields[field] = i + 1;
  return fields;
}, {});

type AppChainId = keyof typeof config;
const chainsById: Record<AppChainId, ChainEntity> = Object.entries(config).reduce(
  (acc, [chainId, chainConfig]) => {
    acc[chainId] = {
      ...chainConfig,
      id: chainId,
      networkChainId: chainConfig.chainId,
    };
    return acc;
  },
  {}
);
const allChainIds: AppChainId[] = Object.keys(chainsById);

async function getAmmIdForAddress(
  vault: VaultConfig,
  ammsByType: Record<string, AmmConfig[]>,
  native: TokenEntity,
  wnative: TokenEntity
): Promise<string | null> {
  if (vault.assets.length !== 2) {
    // Only 2 asset AMMs are supported so far
    return null;
  }

  const tokens: TokenEntity[] = [];
  for (const asset of vault.assets) {
    const token = await getTokenById(asset, vault.network);
    if (!token) {
      if (!WARN_MISSING_ASSET_ON_ACTIVE_VAULTS_ONLY || vault.status === 'active') {
        console.warn(`Token not found for asset ${asset} in vault ${vault.id} on ${vault.network}`);
      }
      return null;
    }
    tokens.push(token);
  }

  const depositTokenAddress = vault.tokenAddress.toLowerCase();
  const lpTokenAddresses = tokens.map(token =>
    (token.address === 'native' ? wnative.address : token.address).toLowerCase()
  );

  if ('uniswapv2' in ammsByType) {
    const amm = ammsByType.uniswapv2.find(amm => {
      const pairAddress = computeUniswapV2PairAddress(
        amm.factoryAddress,
        amm.pairInitHash,
        lpTokenAddresses[0],
        lpTokenAddresses[1]
      );
      return pairAddress && pairAddress.toLowerCase() === depositTokenAddress;
    });

    if (amm) {
      return amm.id;
    }
  }

  if ('solidly' in ammsByType) {
    const amm = ammsByType.solidly.find(amm => {
      const stablePairAddress = computeSolidlyPairAddress(
        amm.factoryAddress,
        amm.pairInitHash,
        lpTokenAddresses[0],
        lpTokenAddresses[1],
        true
      );
      if (stablePairAddress && stablePairAddress.toLowerCase() === depositTokenAddress) {
        return true;
      }

      const volatilePairAddress = computeSolidlyPairAddress(
        amm.factoryAddress,
        amm.pairInitHash,
        lpTokenAddresses[0],
        lpTokenAddresses[1],
        false
      );
      return volatilePairAddress && volatilePairAddress.toLowerCase() === depositTokenAddress;
    });

    if (amm) {
      return amm.id;
    }
  }

  return null;
}

function compareFieldKey(a: string, b: string) {
  const aOrder = FIELD_ORDER[a] || Number.MAX_SAFE_INTEGER;
  const bOrder = FIELD_ORDER[b] || Number.MAX_SAFE_INTEGER;
  return aOrder - bOrder;
}

function sortVaultKeys(vault: VaultConfig & { tokenAmmId?: string }) {
  return sortKeys(vault as any, compareFieldKey);
}

async function getModifiedConfig(chainId: AppChainId) {
  const vaults = await getVaultsForChain(chainId);
  const amms: AmmConfig[] = await getAmmsForChain(chainId);
  const ammsByType = groupBy(amms, 'type');
  const native = await getNativeToken(chainId);
  const wnative = await getWrappedNativeToken(chainId);

  return Promise.all(
    vaults.map(async vault => {
      if (vault.tokenAddress) {
        const ammId = await getAmmIdForAddress(vault, ammsByType, native, wnative);

        if (ammId) {
          console.log(`Adding AMM ${ammId} to vault ${vault.id} on ${vault.network}...`);
          return sortVaultKeys({ ...vault, tokenAmmId: ammId });
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
