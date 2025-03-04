import { config } from '../src/config/config.ts';
import { loadJson, saveJson } from './common/files.ts';
import type { ChainConfig, VaultConfig } from '../src/features/data/apis/config-types.ts';
import pc from 'picocolors';

const vaultsDir = './src/config/vault';

async function start() {
  for (const [chainKey, chainInfo] of Object.entries(config) as unknown as [
    string,
    ChainConfig,
  ][]) {
    if (chainInfo.eol) {
      continue;
    }

    const vaultsFile = `${vaultsDir}/${chainKey}.json`;
    const vaults = await loadJson<VaultConfig[]>(vaultsFile);
    const native = chainInfo.native.symbol;
    const wnative = chainInfo.native.oracleId;
    const findNative = new RegExp(`\\b${native}([-/\\s$])`, 'gmi');

    let shouldSave = false;

    const modifiedVaults = vaults.map(v => {
      if (v.status === 'eol') {
        return v;
      }

      const newName = v.name.replace(findNative, `${wnative}$1`);
      if (newName !== v.name) {
        const oldFormatted = v.name.replace(findNative, `${pc.red(native)}$1`);
        const newFormatted = v.name.replace(findNative, `${pc.green(wnative)}$1`);

        if (!shouldSave) {
          console.log('==', chainKey);
          shouldSave = true;
        }
        console.log(oldFormatted, '->', newFormatted);

        return { ...v, name: newName };
      }
      return v;
    });

    if (shouldSave) {
      await saveJson(vaultsFile, modifiedVaults, 'prettier');
    }
  }
}

start().catch(err => {
  console.error(err);
  process.exit(-1);
});
