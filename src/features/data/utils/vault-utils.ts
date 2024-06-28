import type { VaultEntity, VaultNames } from '../entities/vault';

const typeToSuffix: Record<VaultEntity['type'], string> = {
  standard: 'Vault',
  gov: 'Pool',
  cowcentrated: 'CLM',
};

const typeToSuffixRegex: Record<VaultEntity['type'], RegExp> = {
  standard: / (Vault)$/i,
  gov: / ((?:(?:Earnings|Migration|Reward) )?Pool)$/i,
  cowcentrated: / (CLM)$/i,
};

function getSuffix(name: string, type: VaultEntity['type']) {
  const match = name.match(typeToSuffixRegex[type]);
  return match?.[1] || undefined;
}

export function getVaultTypeSuffix(type: VaultEntity['type']) {
  return typeToSuffix[type];
}

export function getVaultNames(
  configName: string,
  configType: VaultEntity['type'] | undefined
): VaultNames {
  const type = configType || 'standard';
  const suffix = getSuffix(configName, type);
  // without the suffix
  const short = suffix ? configName.slice(0, -(suffix.length + 1)) : configName;
  // with the suffix / default suffix if none found in vault name
  const long = short + ' ' + (suffix || typeToSuffix[type]);

  return {
    short,
    long,
    list: type === 'gov' ? long : short,
    single: type === 'cowcentrated' ? short : long,
    singleMeta: long,
  };
}
