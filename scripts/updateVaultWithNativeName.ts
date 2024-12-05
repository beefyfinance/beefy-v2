// To run: yarn pause gamma
import { promises as fs } from 'fs';
import { config } from '../src/config/config';
import { saveJson } from './common/files';

const vaultsDir = './src/config/vault/';

async function updateNames() {
  for (const [chainKey, chainInfo] of Object.entries(config)) {
    const vaultsFile = `${vaultsDir}${chainKey}.json`;
    const vaults = JSON.parse(await fs.readFile(vaultsFile, 'utf8'));

    vaults.forEach(v => {
      // Create regular expressions for exact matches of native and wrapped tokens
      const nativeRegex = new RegExp(`\\b${chainInfo.native.symbol}([/\s$])`, 'gmi'); // Match the native token as a whole word
      // const nativeRegex = new RegExp(`/\b${chainInfo.native.symbol}([-/\s$])/gmi`)
      const wrappedRegex = new RegExp(`\\b${chainInfo.native.oracleId}\\b`, 'i'); // Match the wrapped token as a whole word
      // const wrappedRegex = new RegExp(`${chainInfo.native.oracleId}$1`); // Match the wrapped token as a whole word

      // Check if the vault name includes the native token and not the wrapped token
      if (nativeRegex.test(v.name) && !wrappedRegex.test(v.name)) {
        // Replace the native token with the wrapped token, handling hyphenated pairs
        v.name = v.name.replace(nativeRegex, chainInfo.native.oracleId);
      }
    });

    await saveJson(vaultsFile, vaults, 'prettier');
  }
}

updateNames().catch(err => {
  console.error(err);
  process.exit(-1);
});
