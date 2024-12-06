// To run: yarn pause gamma
import { promises as fs } from 'fs';
import { config } from '../src/config/config';
import { saveJson } from './common/files';
import { ChainConfig } from '../src/features/data/apis/config-types';

const vaultsDir = './src/config/vault/';

async function pause() {
  for (const [chainKey, chainInfo] of Object.entries(config) as unknown as [
    string,
    ChainConfig
  ][]) {
    if (chainKey === 'base') {
      //skip eol chains
      const vaultsFile = `${vaultsDir}${chainKey}.json`;
      const vaults = JSON.parse(await fs.readFile(vaultsFile, 'utf8'));

      vaults.forEach(v => {
        if (
          v.name.includes(`-${chainInfo.native.symbol} `) &&
          !v.name.includes(chainInfo.native.oracleId) &&
          v.status === 'active'
        ) {
          v.name = v.name.replace(chainInfo.native.symbol, chainInfo.native.oracleId);
        }
      });

      await saveJson(vaultsFile, vaults, 'prettier');
    }
  }
}

pause().catch(err => {
  console.error(err);
  process.exit(-1);
});
