import {
  isCowcentratedVault,
  type VaultCowcentratedLike,
  type VaultEntity,
  type VaultNames,
} from '../entities/vault.ts';

const typeToSuffix: Record<VaultEntity['type'], string> = {
  standard: 'Vault',
  gov: 'Pool',
  cowcentrated: 'CLM',
  erc4626: 'Vault',
};

const typeToSuffixRegex: Record<VaultEntity['type'], RegExp> = {
  standard: / (Vault)$/i,
  gov: / ((?:(?:Earnings|Migration|Reward) )?Pool)$/i,
  cowcentrated: / (CLM)$/i,
  erc4626: / (Vault)$/i,
};

function getSuffix(name: string, type: VaultEntity['type']) {
  const match = name.match(typeToSuffixRegex[type]);
  return match?.[1] || undefined;
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
    //Exception for BIFI Vault to use long name
    list: type === 'gov' || configName === 'BIFI' ? long : short,
    single: type === 'cowcentrated' ? short : long,
    singleMeta: long,
  };
}

export function getCowcentratedAddressFromCowcentratedLikeVault(
  vault: VaultCowcentratedLike
): string {
  return (
    isCowcentratedVault(vault) ?
      vault.receiptTokenAddress
    : vault.depositTokenAddress).toLowerCase();
}
