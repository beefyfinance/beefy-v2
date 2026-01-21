import type { MinterConfig } from '../features/data/apis/config-types.ts';
import type { ChainEntity } from '../features/data/entities/chain.ts';

const mintersPathToImportFn = import.meta.glob<MinterConfig[]>('../config/minters/*.ts', {
  import: 'minters',
});

export async function getMinterConfig(chainId: ChainEntity['id']) {
  const importFn = mintersPathToImportFn[`../config/minters/${chainId}.ts`];
  return importFn ? await importFn() : [];
}
