// To run: yarn pause gamma
import { promises as fs } from 'fs';
import { chains } from '../src/config/config';
import { saveJson } from './common/files';

const vaultsDir = './src/config/vault/';

async function pause() {
  const timestamp = Math.floor(Date.now() / 1000);
  const platformId = process.argv[2];
  for (const chain of chains) {
    const vaultsFile = vaultsDir + chain + '.json';
    const vaults = JSON.parse(await fs.readFile(vaultsFile, 'utf8'));
    vaults.forEach(v => {
      if (v.platformId === platformId && v.status === 'active') {
        v.status = 'paused';
      }
    });
    await saveJson(vaultsFile, vaults, 'prettier');
  }
}

pause().catch(err => {
  console.error(err);
  process.exit(-1);
});
