import { AddressBookChainId } from '../common/config';
import { VaultGroups } from './vault/data-types';
import { RequiredUpdates } from './required-updates';
import { ValidationOptions, VaultValidationOptions } from './options-types';
import { VaultConfig } from '../../src/features/data/apis/config-types';

type MakeRequiredUpdate<TType extends string, TContext = undefined> = {
  type: TType;
  vaultId: string;
  chainId: AddressBookChainId;
  context: TContext;
};

type RemoveEmptyVaultUpdate = MakeRequiredUpdate<
  'remove-empty-vault',
  { earnContractAddress: string }
>;
type EnableHarvestOnDepositUpdate = MakeRequiredUpdate<
  'enable-harvest-on-deposit',
  { from: boolean | undefined }
>;
type FixFeeConfigAddressUpdate = MakeRequiredUpdate<
  'fix-fee-config-address',
  {
    from: string | undefined;
    to: string | undefined;
    strategyAddress: string;
    strategyOwner: string | undefined;
  }
>;
type FixFeeRecipientAddressUpdate = MakeRequiredUpdate<
  'fix-fee-recipient-address',
  {
    from: string | undefined;
    to: string | undefined;
    strategyAddress: string;
    strategyOwner: string | undefined;
  }
>;
type FixRewardPoolOwner = MakeRequiredUpdate<
  'fix-reward-pool-owner',
  {
    earnContractAddress: string;
    from: string | undefined;
    to: string;
  }
>;
type FixVaultOwner = MakeRequiredUpdate<
  'fix-vault-owner',
  {
    earnContractAddress: string;
    from: string | undefined;
    to: string;
  }
>;
type FixStrategyOwner = MakeRequiredUpdate<
  'fix-strategy-owner',
  {
    from: string | undefined;
    to: string | undefined;
    strategyAddress: string;
  }
>;
type FixStrategyKeeper = MakeRequiredUpdate<
  'fix-strategy-keeper',
  {
    from: string | undefined;
    to: string | undefined;
    strategyAddress: string;
    strategyOwner: string | undefined;
  }
>;

type FixVaultField = MakeRequiredUpdate<
  'fix-vault-field',
  {
    field: keyof VaultConfig;
    from: any;
    to: VaultConfig[keyof VaultConfig];
  }
>;

export type AnyRequiredUpdate =
  | RemoveEmptyVaultUpdate
  | EnableHarvestOnDepositUpdate
  | FixFeeConfigAddressUpdate
  | FixFeeRecipientAddressUpdate
  | FixRewardPoolOwner
  | FixVaultOwner
  | FixStrategyOwner
  | FixStrategyKeeper
  | FixVaultField;

export type UpdateTypeToContext<TType extends AnyRequiredUpdate['type']> = Extract<
  AnyRequiredUpdate,
  {
    type: TType;
  }
>['context'];

export type UpdatesByType = {
  [K in AnyRequiredUpdate['type']]?: {
    __type: K;
    updates: Extract<AnyRequiredUpdate, { type: K }>[];
  };
};

export type AddRequiredUpdateFn = <TType extends AnyRequiredUpdate['type']>(
  vaultId: string,
  type: TType,
  context: UpdateTypeToContext<TType>
) => false;

export type GlobalValidateContext = {
  verbose: boolean;
  options: ValidationOptions;
  seenVaultIds: Set<string>;
  requiredUpdates: RequiredUpdates;
};

export type VaultValidateContext = {
  globalContext: GlobalValidateContext;
  chainId: AddressBookChainId;
  vaults: VaultGroups;
  addRequiredUpdate: AddRequiredUpdateFn;
  seenEarnedTokens: Set<string>;
  seenEarnedTokenAddresses: Set<string>;
  vaultOwners: VaultValidationOptions['vaultOwners'][AddressBookChainId];
  rewardPoolOwners: VaultValidationOptions['rewardPoolOwners'][AddressBookChainId];
  strategyOwners: VaultValidationOptions['strategyOwners'][AddressBookChainId];
  strategyKeepers: VaultValidationOptions['strategyKeepers'][AddressBookChainId];
  /** The current fee recipient address that should be set */
  feeRecipient: string;
  /** The current fee config address that should be set */
  feeConfig: string | undefined; // undefined for heco, fuse, one
};
