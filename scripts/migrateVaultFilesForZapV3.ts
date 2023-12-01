import type { ChainEntity } from '../src/features/data/entities/chain';
import { config } from '../src/config/config';
import { getAmmsForChain, getVaultsForChain } from './common/config';
import type { AmmConfig, VaultConfig } from '../src/features/data/apis/config-types';
import { omit } from 'lodash';
import { saveJson } from './common/utils';
import { sortVaultKeys } from './common/vault-fields';
import type { StrategyOptions } from '../src/features/data/apis/transact/strategies/IStrategy';
import type { AmmEntity } from '../src/features/data/entities/zap';

type OldVaultConfig = Omit<VaultConfig, 'tokenAmmId' | 'isGovVault' | 'depositFee'> & {
  tokenAmmId?: AmmEntity['id'];
  isGovVault?: boolean;
  depositFee?: string;
};

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

type ZapSupport = Record<string, ('beefy' | 'oneInch')[]>;

function ammTypeToStrategyId(type: string): StrategyOptions['strategyId'] {
  if (type === 'uniswapv2') {
    return 'uniswap-v2';
  }
  if (['uniswap-v2', 'solidly', 'single'].includes(type)) {
    return type as StrategyOptions['strategyId'];
  }
  throw new Error(`Unknown amm type: ${type}`);
}

async function getZapConfig(
  vault: OldVaultConfig,
  zapSupport: ZapSupport,
  amm: AmmConfig | undefined
): Promise<StrategyOptions | undefined> {
  if (amm) {
    return {
      strategyId: ammTypeToStrategyId(amm.type),
      ammId: amm.id,
    };
  } else if (vault.assets.length === 1 && zapSupport[vault.id]?.length > 0) {
    // single asset with at least one supported zap, use strategy single
    return {
      strategyId: 'single',
    };
  } else if (
    ['venus-bnb', 'aavev3-op-eth', 'exactly-supply-eth', 'aavev3-avax'].includes(vault.id)
  ) {
    return {
      strategyId: 'single',
    };
  }

  return undefined;
}

async function fetchZapSupport() {
  const response = await fetch('https://api.beefy.finance/vaults/zap-support');
  const data = await response.json();
  return data as ZapSupport;
}

async function getModifiedConfig(chainId: AppChainId): Promise<VaultConfig[]> {
  const vaults = (await getVaultsForChain(chainId)) as unknown as OldVaultConfig[];
  const amms: AmmConfig[] = await getAmmsForChain(chainId);
  const zapSupport = await fetchZapSupport();

  return Promise.all(
    vaults.map(async oldVault => {
      const newVault: VaultConfig = omit(oldVault, ['tokenAmmId', 'isGovVault', 'depositFee']);
      let amm: AmmConfig | undefined;

      if (oldVault.tokenAmmId) {
        amm = amms.find(amm => amm.id === oldVault.tokenAmmId);
      }

      const zapConfig = await getZapConfig(oldVault, zapSupport, amm);
      if (zapConfig) {
        newVault.zaps = [zapConfig];
      }

      if (oldVault.isGovVault) {
        newVault.type = 'gov';
      } else {
        newVault.type = 'standard';
      }

      if (oldVault.depositFee) {
        // "1%", "0.5%", "0.1%", "<0.1%" -> 0.01, 0.005, 0.001, 0.001
        newVault.depositFee =
          parseFloat(oldVault.depositFee.replace('%', '').replace('<', '')) / 100;
      }

      return sortVaultKeys(newVault);
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
