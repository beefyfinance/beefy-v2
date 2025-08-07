import { sample } from 'lodash-es';
import { ChainId } from 'blockchain-addressbook';
import { chains, config } from '../../src/config/config.ts';
import type {
  AmmConfig,
  ChainConfig,
  MinterConfig,
  VaultConfig,
} from '../../src/features/data/apis/config-types.ts';
import type { PromoConfig } from '../../src/features/data/apis/promos/types.ts';

/** Harmony->One to match addressbook */
const chainConfigs = chains.reduce(
  (acc, id) => {
    acc[appToAddressBookId(id)] = {
      id,
      ...config[id],
    };
    return acc;
  },
  {} as Record<AddressBookChainId, ChainConfig>
);

export type AddressBookChainId = keyof typeof ChainId;
export type AppChainId = keyof typeof config;

export type ChainMap<T> = Partial<Record<AddressBookChainId, T>>;
export type AppChainMap<T> = Partial<Record<AppChainId, T>>;

/**
 * What chains to exclude from chainIds array and thus any validation
 * Use `yarn makeExcludeConfig chain` to generate the hash
 * Key must be the addressbook/api chain id, not app chain id (i.e. use one over harmony)
 * */
export const excludeChains: ChainMap<{ count: number; hash: string }> = {
  heco: {
    count: 35,
    hash: 'ccab3fea9945e6474f803946d72001a04245fb2556f340ebee7a65af61be4773',
  },
  one: {
    count: 22,
    hash: 'a38575f5cdb9ef6ce6d31e93695aadb02baca9f070366f2acee79d260e5e2391',
  },
  fuse: {
    count: 28,
    hash: '496b1a976f7d822f32cb4d19e570aa77ea3aef6a0ad77045146c9039c12e9f17',
  },
  emerald: {
    count: 10,
    hash: 'f74673e540c41ec7ab283c9d07ac2090453ab34be8824e8178c0a853fcaf80b1',
  },
  aurora: {
    count: 24,
    hash: '13d2d19d7c96406a0d46042c521b6d7e19ee63b94474916a21eb2f1d69c15f57',
  },
  celo: {
    count: 14,
    hash: 'fe0549fd08678e577d17796df5b36ce28e4546bd9a1cc652196c6fa85bcaa482',
  },
  moonriver: {
    count: 51,
    hash: 'ac20aae49f323550c3dae1a74b15b4852f3e9e7dd76f4eec055948148257d4bd',
  },
  canto: {
    count: 36,
    hash: '263fc197d9d5447d4a47854cf12dd8abac9c891573dedeb6db3d14ebdc75cc53',
  },
  kava: {
    count: 36,
    hash: 'ae8214d27a1ac70c0ac99fee47776b57ab9d0c5feefdd10689241f5427657a4e',
  },
  real: {
    count: 14,
    hash: 'd6d09c5287828a3cad212f59cfcc062f93913143fec6e53cbe1e6b8451032ea7',
  },
  zkevm: {
    count: 14,
    hash: '3c0b5912d989a8825916118d50ff72a6a9b9bbf2ea2c65b2579f759ef17239e8',
  },
  manta: {
    count: 8,
    hash: '213e11533e3173172b0476d79675b2d9930226811faf8fce7fea01238b5d1366',
  },
  cronos: {
    count: 49,
    hash: 'ab8d548370e2613888ce97a8fa50211f169851a04d32a927f33c773bfa2ca0de',
  },
  fantom: {
    count: 335,
    hash: 'b279b76f4af675fb863ee6ed0ce3717403994c7759022262700d5570ee212f28',
  },
  scroll: {
    count: 35,
    hash: 'f493066ad95ca04e5f53f3b97bb6fdeec7190148c4fd8e6db05f019c89fa1a9f',
  },
  mode: {
    count: 27,
    hash: '2134d0db2850cb4d25ed3aa79c34461696bd278db4e4ab1b9bb470ee94bf7868',
  },
};

export const allChainIds = Object.keys(chainConfigs) as AddressBookChainId[];
export const excludedChainIds = (Object.keys(excludeChains) as AddressBookChainId[]).filter(
  k => !!chainConfigs[k]
);
export const chainIds = allChainIds.filter(chainId => !(chainId in excludeChains));

const chainRpcs = allChainIds.reduce(
  (acc, chainId) => {
    acc[chainId] =
      process.env[`${addressBookToAppId(chainId).toUpperCase()}_RPC`] ||
      sample(chainConfigs[chainId].rpc)!;
    return acc;
  },
  {} as Record<AddressBookChainId, string>
);

export function getChain(chainId: string): ChainConfig {
  const addressBookId = appToAddressBookId(chainId);
  const config = chainConfigs[addressBookId];
  if (!config) {
    throw new Error(`No config for chain ${chainId}`);
  }
  return config;
}

export function getChainRpc(chainId: string): string {
  return chainRpcs[appToAddressBookId(chainId)];
}

export async function getAllVaultConfigsByChainId(): Promise<{ [chainId: string]: VaultConfig[] }> {
  const vaults: { [chainId: string]: VaultConfig[] } = {};
  for (const chainId of chainIds) {
    const chainVaults = await getVaultsForChain(chainId);
    vaults[chainId] = chainVaults;
  }
  return vaults;
}

const vaultsByChainId: AppChainMap<VaultConfig[]> = {};

export async function getVaultsForChain(chainId: string): Promise<VaultConfig[]> {
  const id = addressBookToAppId(chainId);
  const vaults = vaultsByChainId[id];

  if (vaults) {
    return vaults;
  }

  return (vaultsByChainId[id] = (await import(`../../src/config/vault/${id}.json`))
    .default as VaultConfig[]);
}

const promosImporters = import.meta.glob<PromoConfig[]>('../../src/config/promos/chain/*.json', {
  import: 'default',
});
const promosByChainId: AppChainMap<PromoConfig[]> = {};

export async function getPromosForChain(chainId: string): Promise<PromoConfig[]> {
  const id = addressBookToAppId(chainId);

  if (!(id in promosByChainId)) {
    const importer = promosImporters[`../../src/config/promos/chain/${id}.json`];
    if (importer) {
      promosByChainId[id] = await importer();
    } else {
      promosByChainId[id] = [];
    }
  }

  return promosByChainId[id]!;
}

const ammsByChainId: AppChainMap<AmmConfig[]> = {};

export async function getAmmsForChain(chainId: string): Promise<AmmConfig[]> {
  const id = addressBookToAppId(chainId);

  if (!(id in ammsByChainId)) {
    ammsByChainId[id] = (await import(`../../src/config/zap/amm/${id}.json`)).default;
  }

  return ammsByChainId[id]!;
}

const mintersByChainId: AppChainMap<MinterConfig[]> = {};

export async function getMintersForChain(chainId: string): Promise<MinterConfig[]> {
  const id = addressBookToAppId(chainId);

  if (!(id in mintersByChainId)) {
    mintersByChainId[id] = (await import(`../../src/config/minters/${id}.tsx`)).minters;
  }

  return mintersByChainId[id]!;
}

export function appToAddressBookId(chainId: string): AddressBookChainId {
  if (chainId === 'harmony') {
    return 'one';
  }
  if (chainId in ChainId) {
    return chainId as AddressBookChainId;
  }
  throw new Error(`Unknown app chain id ${chainId}`);
}

export function addressBookToAppId(chainId: string): AppChainId {
  if (chainId === 'one') {
    return 'harmony' as AppChainId;
  }
  if (chainId in config) {
    return chainId as AppChainId;
  }
  throw new Error(`Unknown address book chain id ${chainId}`);
}
