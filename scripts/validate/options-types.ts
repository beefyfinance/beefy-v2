import { AddressBookChainId } from '../common/config';
import { vaultValidators } from './vault/validators';
import { AnyVaultWithData } from './vault/data-types';
import { PointProviderConfig } from './point-provider/config-types';
import { BeefyFinance } from 'blockchain-addressbook/build/types/beefyfinance';
import { KeysOfType } from '../../src/features/data/utils/types-utils';
import { VaultConfig } from '../../src/features/data/apis/config-types';

type VaultValidators = typeof vaultValidators;

type SkipValidatorOptions = {
  [K in keyof VaultValidators]?: {
    [P in keyof VaultValidators[K]]?: {
      chains?: Set<AddressBookChainId>;
    };
  };
};

type ExpectVaultMap<T> = {
  [vaultId: string]: { value: T; reason: string };
};

type ExceptionsValidatorOptions = {
  isFeeConfigCorrect?: ExpectVaultMap<string | undefined>;
  isHarvestOnDepositCorrect?: ExpectVaultMap<false | undefined>;
  isKeeperCorrect?: ExpectVaultMap<string>;
  isStrategyOwnerCorrect?: ExpectVaultMap<string | undefined>;
  isVaultOwnerCorrect?: ExpectVaultMap<string | undefined>;
  isRewardPoolOwnerCorrect?: ExpectVaultMap<string>;
  isFeeRecipientCorrect?: ExpectVaultMap<string>;
};

type ChainAddressMapWithDefault<TDefault extends keyof BeefyFinance> = {
  [chainId in AddressBookChainId]: {
    all: Set<string>;
    default: BeefyFinance[TDefault];
  };
};

type VaultConfigFilter = {
  [K in keyof VaultConfig]?: Array<VaultConfig[K]>;
};

type RequiredVaultConfig = {
  [K in keyof VaultConfig]?: Array<{
    value: VaultConfig[K];
    matching: VaultConfigFilter;
  }>;
};

export type VaultValidationOptions = {
  /** Vault fields */
  fields: {
    /** Require a specific field value on vaults matching the supplied filter */
    required?: RequiredVaultConfig;
    /** What fields are no longer required (and why) */
    legacy: Record<string, string>;
    /** What fields are addresses that should be check summed */
    checksum: (keyof AnyVaultWithData)[];
  };
  /** All valid vault owners by chain */
  vaultOwners: ChainAddressMapWithDefault<'vaultOwner'>;
  /** All valid strategy owners by chain */
  strategyOwners: ChainAddressMapWithDefault<'strategyOwner'>;
  /** All valid reward pool/gov owners by chain */
  rewardPoolOwners: ChainAddressMapWithDefault<'devMultisig'>;
  /** All valid strategy keepers by chain */
  strategyKeepers: ChainAddressMapWithDefault<'keeper'>;
  /** assets[] validation options */
  assets?: {
    missingAllowedForEolCreatedBefore?: number;
    /** e.g. for gmx-arb-doge-usdc, DOGE does not exist on arbitrum so can not be added to address book */
    syntheticsNotInAddressBook?: {
      [chainId in AddressBookChainId]?: Set<string>;
    };
  };
  /** Skip validators for specific chains/groups */
  skip?: SkipValidatorOptions;
  /** Custom expected results for specific vaults / validators */
  exceptions?: ExceptionsValidatorOptions;
};

export type PointValidatorOptions = {
  providerById: Map<string, PointProviderConfig>;
};

export type ValidationOptions = {
  /** Options for vaults */
  vaults: VaultValidationOptions;
  /** Options for Point Providers (points.json) */
  points: PointValidatorOptions;
};

export type ChainAddressSetOptionKeys = KeysOfType<
  VaultValidationOptions,
  ChainAddressMapWithDefault<keyof BeefyFinance>
>;

export type BeefyRequiredAddressKeys = KeysOfType<BeefyFinance, string>;

export type OptionalChainBeefyAddressKeyMap<T extends keyof BeefyFinance> = Partial<
  Record<AddressBookChainId, Exclude<BeefyRequiredAddressKeys, T>[]>
>;

export type VaultValidationOptionsBuilderInput = Omit<
  VaultValidationOptions,
  'vaultOwners' | 'strategyOwners' | 'rewardPoolOwners' | 'strategyKeepers'
> & {
  /** Use `exceptions` for addresses not in beefy platform in address book */
  additionalVaultOwners?: OptionalChainBeefyAddressKeyMap<'vaultOwner'>;
  /** Use `exceptions` for addresses not in beefy platform in address book */
  additionalRewardPoolOwners?: OptionalChainBeefyAddressKeyMap<'devMultisig'>;
  /** Use `exceptions` for addresses not in beefy platform in address book */
  additionalStrategyOwners?: OptionalChainBeefyAddressKeyMap<'strategyOwner'>;
  /** Use `exceptions` for addresses not in beefy platform in address book */
  additionalKeepers?: OptionalChainBeefyAddressKeyMap<'keeper'>;
};

export type ValidationOptionsBuilderInput = Omit<ValidationOptions, 'vaults' | 'points'> & {
  vaults: VaultValidationOptionsBuilderInput;
  // points: auto-generated
};
