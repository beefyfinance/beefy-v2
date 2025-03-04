// To run: yarn pause gamma
import { chains } from '../src/config/config.ts';
import { loadJson, saveJson } from './common/files.ts';
import type { VaultConfig } from '../src/features/data/apis/config-types.ts';

const vaultsDir = './src/config/vault/';

async function pause() {
  const timestamp = Math.floor(Date.now() / 1000);
  const platformId = process.argv[2];
  for (const chain of chains) {
    const vaultsFile = vaultsDir + chain + '.json';
    const vaults = await loadJson<VaultConfig[]>(vaultsFile);
    vaults.forEach(v => {
      if (v.platformId === platformId && v.status === 'active') {
        v.status = 'paused';
        v.pausedAt = timestamp;
      }
    });
    await saveJson(vaultsFile, vaults, 'prettier');
  }
}

pause().catch(err => {
  console.error(err);
  process.exit(-1);
});
