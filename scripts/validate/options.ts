import { mapValues, omit } from 'lodash';
import { addressBook } from 'blockchain-addressbook';
import {
  BeefyRequiredAddressKeys,
  ChainAddressSetOptionKeys,
  OptionalChainBeefyAddressKeyMap,
  ValidationOptions,
  ValidationOptionsBuilderInput,
} from './options-types';
import pointProviders from '../../src/config/points.json';

export function buildOptions(input: ValidationOptionsBuilderInput): ValidationOptions {
  return {
    ...omit(input, ['vaults']),
    vaults: {
      ...omit(input.vaults, [
        'vaultOwners',
        'rewardPoolOwners',
        'strategyOwners',
        'strategyKeepers',
      ]),
      // omit returns all keys as optional, so we need to re-add required keys
      fields: input.vaults.fields,
      // build owners from default + any additional
      vaultOwners: buildBeefyAddresses(
        'vaultOwners',
        'vaultOwner',
        input.vaults.additionalVaultOwners
      ),
      rewardPoolOwners: buildBeefyAddresses(
        'rewardPoolOwners',
        'devMultisig',
        input.vaults.additionalRewardPoolOwners
      ),
      strategyOwners: buildBeefyAddresses(
        'strategyOwners',
        'strategyOwner',
        input.vaults.additionalStrategyOwners
      ),
      strategyKeepers: buildBeefyAddresses(
        'strategyKeepers',
        'keeper',
        input.vaults.additionalKeepers
      ),
    },
    points: {
      providerById: buildPointProviders(),
    },
  };
}

function buildBeefyAddresses<
  TOption extends ChainAddressSetOptionKeys,
  TDefault extends BeefyRequiredAddressKeys
>(
  _option: TOption,
  defaultKey: TDefault,
  additional?: OptionalChainBeefyAddressKeyMap<TDefault>
): ValidationOptions['vaults'][TOption] {
  const addresses = mapValues(addressBook, chain => ({
    all: new Set([chain.platforms.beefyfinance[defaultKey]]),
    default: chain.platforms.beefyfinance[defaultKey],
  }));

  if (!additional) {
    return addresses;
  }

  for (const [chainId, keys] of Object.entries(additional)) {
    if (keys) {
      for (const key of keys) {
        addresses[chainId].all.add(addressBook[chainId].platforms.beefyfinance[key]);
      }
    }
  }

  return addresses;
}

function buildPointProviders(): ValidationOptions['points']['providerById'] {
  return new Map(pointProviders.map(pointProvider => [pointProvider.id, pointProvider]));
}
