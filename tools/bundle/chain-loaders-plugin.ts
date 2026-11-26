import type { Plugin } from 'vite';
import { enabledChainIds } from '../../src/config/config.ts';

type ChainLoaderSource = {
  specifier: (chainId: string) => string;
  exportName: (chainId: string) => string;
  optional?: boolean;
  singleChunk?: boolean;
};

type ChainModule = {
  chainId: string;
  specifier: string;
  exportName: string;
};

const VIRTUAL_ID = 'virtual:chain-loaders';
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`;

function addressBookSpecifier(chainId: string) {
  return `@beefyfinance/blockchain-addressbook/${chainId}`;
}

const defaultExport = () => 'default';

const sources: Record<string, ChainLoaderSource> = {
  addressBook: {
    specifier: addressBookSpecifier,
    exportName: chainId => chainId,
    singleChunk: true,
  },
  vaults: { specifier: id => `/src/config/vault/${id}.json`, exportName: defaultExport },
  amms: {
    specifier: id => `/src/config/zap/amm/${id}.json`,
    exportName: defaultExport,
    optional: true,
  },
  promos: {
    specifier: id => `/src/config/promos/chain/${id}.json`,
    exportName: defaultExport,
    optional: true,
  },
  minters: {
    specifier: id => `/src/config/minters/${id}.ts`,
    exportName: () => 'minters',
    optional: true,
  },
};

async function findChainModules(
  name: string,
  source: ChainLoaderSource,
  resolve: (specifier: string) => Promise<unknown>
): Promise<ChainModule[]> {
  const modules: ChainModule[] = [];
  for (const chainId of enabledChainIds) {
    const specifier = source.specifier(chainId);
    if (await resolve(specifier)) {
      modules.push({ chainId, specifier, exportName: source.exportName(chainId) });
    } else if (!source.optional) {
      throw new Error(`${name} has no module for chain ${chainId}: ${specifier}`);
    }
  }
  return modules;
}

function loaderEntry(chainId: string, specifier: string, exportName: string) {
  return `  ${JSON.stringify(chainId)}: () => import(${JSON.stringify(specifier)}).then(m => m[${JSON.stringify(exportName)}]),`;
}

export function chainLoadersPlugin(): Plugin {
  return {
    name: 'chain-loaders',
    config() {
      return { optimizeDeps: { include: enabledChainIds.map(addressBookSpecifier) } };
    },
    resolveId(id) {
      return id === VIRTUAL_ID || id.startsWith(`${VIRTUAL_ID}/`) ? `\0${id}` : undefined;
    },
    async load(id) {
      const resolve = (specifier: string) => this.resolve(specifier);

      if (id === RESOLVED_VIRTUAL_ID) {
        const exports: string[] = [];
        for (const [name, source] of Object.entries(sources)) {
          const modules = await findChainModules(name, source, resolve);
          const loaders = modules.map(module =>
            source.singleChunk ?
              loaderEntry(module.chainId, `${VIRTUAL_ID}/${name}`, module.chainId)
            : loaderEntry(module.chainId, module.specifier, module.exportName)
          );
          exports.push(`export const ${name} = {\n${loaders.join('\n')}\n};`);
        }
        return exports.join('\n\n');
      }

      if (id.startsWith(`${RESOLVED_VIRTUAL_ID}/`)) {
        const name = id.slice(RESOLVED_VIRTUAL_ID.length + 1);
        const source = sources[name];
        if (!source?.singleChunk) {
          return undefined;
        }
        const modules = await findChainModules(name, source, resolve);
        return modules
          .map(
            module =>
              `export { ${module.exportName} as ${module.chainId} } from ${JSON.stringify(module.specifier)};`
          )
          .join('\n');
      }

      return undefined;
    },
  };
}
