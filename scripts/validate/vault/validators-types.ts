import { VaultValidateContext } from '../required-updates-types';
import { AnyVaultWithData, VaultGroups } from './data-types';

export type VaultValidatorFn<T extends AnyVaultWithData> = (
  vault: T,
  context: VaultValidateContext
) => boolean;

export type VaultValidatorsCheck = {
  [K in keyof VaultGroups]?: Record<string, VaultValidatorFn<VaultGroups[K][number]>>;
};
