import { AddressBookChainId } from '../../../../common/config';
import { addressBook } from 'blockchain-addressbook';
import { Address, isAddress } from 'viem';
import { pConsole } from '../../../utils/console';
import { getVaultsFromFactory } from './factory';

export async function findVaultForClm(
  chainId: AddressBookChainId,
  clmAddress: string
): Promise<Address | undefined> {
  const chainBook = addressBook[chainId];
  const vaultFactory = chainBook.platforms.beefyfinance.vaultFactory;
  if (!vaultFactory || !isAddress(vaultFactory)) {
    pConsole.warn(`No vaultFactory in ${chainId} address book`);
    return undefined;
  }

  try {
    const vaultsWithWant = await getVaultsFromFactory(chainId, vaultFactory);
    const matchingVault = vaultsWithWant.find(vault => vault.wantAddress === clmAddress);
    if (matchingVault) {
      return matchingVault.vaultAddress;
    }
  } catch (err) {
    pConsole.error('Failed to check for vault using block explorer', err);
    return undefined;
  }

  return undefined;
}

export function parseVaultName(name: string) {
  const parts = name.split(' ');
  if (parts[0] !== 'Cow') {
    throw new Error(`Invalid vault name, only 'Cow' names supported: ${name}`);
  }

  if (parts.length === 4) {
    const [prefix, platform, chain, asset] = parts;
    const [asset0, asset1] = asset.split('-');
    return {
      prefix,
      platform,
      chain,
      asset0,
      asset1,
    };
  }

  if (parts.length === 3) {
    const [prefix, platform, asset] = parts;
    const [asset0, asset1] = asset.split('-');
    return {
      prefix,
      platform,
      asset0,
      asset1,
    };
  }

  throw new Error(`Failed to parse vault name: ${name}`);
}
