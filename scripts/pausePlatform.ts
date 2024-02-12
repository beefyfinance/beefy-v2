// To run: yarn pause gamma
import { promises as fs } from 'fs';
import { chains } from '../src/config/config';

const vaultsDir = './src/config/vault/';

async function pause() {
  const platformId = process.argv[2];
  for (const chain of chains) {
    const vaultsFile = vaultsDir + chain + '.json';
    const vaults = JSON.parse(await fs.readFile(vaultsFile, 'utf8'));
    vaults.forEach(v => {
      if (v.platformId === platformId && v.status === 'active') {
        v.status = 'paused';
      }
    });
    await fs.writeFile(vaultsFile, JSON.stringify(vaults, null, 2));
  }
}

pause().catch(err => {
  console.error(err);
  process.exit(-1);
});
