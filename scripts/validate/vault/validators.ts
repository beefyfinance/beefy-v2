import { addressBook } from 'blockchain-addressbook';
import BigNumber from 'bignumber.js';
import { VaultValidateContext } from '../required-updates-types';
import { isDefined, isValidChecksumAddress, ZERO_ADDRESS } from '../../common/utils';
import { addressBookToAppId } from '../../common/config';
import { VaultValidatorsCheck } from './validators-types';
import {
  AnyVaultWithData,
  CowcentratedWithData,
  GovWithData,
  StandardWithData,
} from './data-types';
import { doesStrategyTypeIdExistForVaultType } from '../strategy-type/validators';
import { doesPlatformIdExist } from '../platform/validators';
import { uniq } from 'lodash';
import { pconsole } from '../../common/pconsole';
import { VaultConfig } from '../../../src/features/data/apis/config-types';

export const vaultValidators = {
  all: {
    isIdValid,
    isTypeValid,
    isEarnedTokenValid,
    isStrategyTypeIdValid,
    isPlatformIdValid,
    isOracleValid,
    isOracleIdValid,
    isTokenProviderIdValid,
    isCreatedAtValid,
    isUpdatedAtValid,
    isRetiredAtValid,
    isPausedAtValid,
    isNetworkValid,
    areAssetsValid,
    doesConfigHaveNoOldFields,
    areAddressesValid,
    arePointsStructureIdsValid,
    isRequiredVaultConfigSatisfied,
  },
  allCowcentrated: {
    isVaultEarnedTokenAddressValid,
    isEarnedTokenContractAddressSame,
    isNotZeroSupply,
    isVaultOwnerCorrect,
    isStrategyOwnerCorrect,
    isStrategyKeeperCorrect,
    isFeeRecipientCorrect,
    isFeeConfigCorrect,
    doesCowcentratedHavePool,
    doesBeefyOracleHaveEntriesForWants,
    isPlatformIdBeefy,
  },
  allStandard: {
    isVaultEarnedTokenAddressValid,
    isEarnedTokenContractAddressSame,
    isNotZeroSupply,
    isVaultOwnerCorrect,
    isStrategyOwnerCorrect,
    isStrategyKeeperCorrect,
    isFeeRecipientCorrect,
    isFeeConfigCorrect,
    isHarvestOnDepositCorrect,
  },
  allGov: {
    isRewardPoolOwnerCorrect,
  },
  baseGov: {
    isGovEarnedTokenAddressValid,
  },
  cowcentratedGov: {
    isPlatformIdSameAsCowcentratedTokenProviderId,
    isTokenProviderIdSameAsCowcentratedTokenProviderId,
    isStrategyTypeIdSameAsCowcentratedStrategyTypeId,
  },
  cowcentratedStandard: {
    isPlatformIdSameAsCowcentratedTokenProviderId,
    isTokenProviderIdSameAsCowcentratedTokenProviderId,
    isStrategyTypeIdSameAsCowcentratedStrategyTypeId,
  },
} as const satisfies VaultValidatorsCheck;

const validVaultTypes = new Set(['standard', 'gov', 'cowcentrated']);

function isTypeValid(vault: AnyVaultWithData) {
  if (!validVaultTypes.has(vault.type)) {
    pconsole.error(`${vault.id}: Invalid type "${vault.type}"`);
    return false;
  }

  return true;
}

function isStrategyKeeperCorrect(
  vault: StandardWithData | CowcentratedWithData,
  { addRequiredUpdate, strategyKeepers, globalContext }: VaultValidateContext
) {
  if (vault.status === 'eol') {
    return true;
  }

  const isExpected = vault.keeper && strategyKeepers.all.has(vault.keeper);
  const exception = globalContext.options?.vaults.exceptions?.isKeeperCorrect?.[vault.id];
  const isException = exception && vault.keeper === exception.value;

  if (isExpected && exception && vault.keeper !== exception.value) {
    pconsole.warn(`Vault ${vault.id}: Has an unneeded exception for isKeeperCorrect`);
  }

  if (!isExpected && !isException) {
    pconsole.error(
      `Vault ${vault.id}: Should update keeper. From: ${vault.keeper} To: ${strategyKeepers.default}`
    );

    return addRequiredUpdate(vault.id, 'fix-strategy-keeper', {
      strategyAddress: vault.strategy,
      strategyOwner: vault.strategyOwner,
      from: vault.keeper,
      to: strategyKeepers.default,
    });
  }

  return true;
}

function isStrategyOwnerCorrect(
  vault: StandardWithData | CowcentratedWithData,
  { addRequiredUpdate, strategyOwners, globalContext }: VaultValidateContext
) {
  const isExpected = vault.strategyOwner && strategyOwners.all.has(vault.strategyOwner);
  const exception = globalContext.options?.vaults.exceptions?.isStrategyOwnerCorrect?.[vault.id];
  const isException = exception && vault.strategyOwner === exception.value;

  if (isExpected && exception && vault.strategyOwner !== exception.value) {
    pconsole.warn(`Vault ${vault.id}: Has an unneeded exception for isStrategyOwnerCorrect`);
  }

  if (!isExpected && !isException) {
    pconsole.error(
      `Vault ${vault.id}: Should update strategyOwner owner. From: ${vault.strategyOwner} To: ${strategyOwners.default}`
    );

    return addRequiredUpdate(vault.id, 'fix-strategy-owner', {
      strategyAddress: vault.strategy,
      from: vault.strategyOwner,
      to: strategyOwners.default,
    });
  }

  return true;
}

function isVaultOwnerCorrect(
  vault: StandardWithData | CowcentratedWithData,
  { addRequiredUpdate, vaultOwners, globalContext }: VaultValidateContext
) {
  const isExpected = vault.vaultOwner && vaultOwners.all.has(vault.vaultOwner);
  const exception = globalContext.options?.vaults.exceptions?.isVaultOwnerCorrect?.[vault.id];
  const isException = exception && vault.vaultOwner === exception.value;

  if (isExpected && exception && vault.vaultOwner !== exception.value) {
    pconsole.warn(`Vault ${vault.id}: has an unneeded exception for isVaultOwnerCorrect`);
  }

  if (!isExpected && !isException) {
    pconsole.error(
      `Vault ${vault.id}: should update vault owner. From: ${vault.vaultOwner} To: ${vaultOwners.default}`
    );

    return addRequiredUpdate(vault.id, 'fix-vault-owner', {
      earnContractAddress: vault.earnContractAddress,
      from: vault.vaultOwner,
      to: vaultOwners.default,
    });
  }

  return true;
}

function isRewardPoolOwnerCorrect(
  vault: GovWithData,
  { addRequiredUpdate, rewardPoolOwners, globalContext }: VaultValidateContext
) {
  const isExpected = vault.rewardPoolOwner && rewardPoolOwners.all.has(vault.rewardPoolOwner);
  const exception = globalContext.options?.vaults.exceptions?.isRewardPoolOwnerCorrect?.[vault.id];
  const isException = exception && vault.rewardPoolOwner === exception.value;

  if (isExpected && exception && vault.rewardPoolOwner !== exception.value) {
    pconsole.warn(`Vault ${vault.id}: has an unneeded exception for isRewardPoolOwnerCorrect`);
  }

  if (!isExpected && !isException) {
    pconsole.error(
      `Reward Vault ${vault.id}: should update owner. From: ${vault.rewardPoolOwner} To: ${rewardPoolOwners.default}`
    );

    return addRequiredUpdate(vault.id, 'fix-reward-pool-owner', {
      earnContractAddress: vault.earnContractAddress,
      from: vault.rewardPoolOwner,
      to: rewardPoolOwners.default,
    });
  }

  return true;
}

function isFeeRecipientCorrect(
  vault: StandardWithData | CowcentratedWithData,
  { addRequiredUpdate, feeRecipient, globalContext }: VaultValidateContext
) {
  if (vault.status === 'eol') {
    return true;
  }

  const isExpected = vault.feeRecipient && vault.feeRecipient === feeRecipient;
  const exception = globalContext.options?.vaults.exceptions?.isFeeRecipientCorrect?.[vault.id];
  const isException = exception && vault.feeRecipient === exception.value;

  if (isExpected && exception && vault.feeRecipient !== exception.value) {
    pconsole.warn(`Vault ${vault.id}: has an unneeded exception for isFeeRecipientCorrect`);
  }

  if (!isExpected && !isException) {
    pconsole.error(
      `Vault ${vault.id}: should update beefy fee recipient. From: ${vault.feeRecipient} To: ${feeRecipient}`
    );

    return addRequiredUpdate(vault.id, 'fix-fee-recipient-address', {
      from: vault.feeRecipient,
      to: feeRecipient,
      strategyAddress: vault.strategy,
      strategyOwner: vault.strategyOwner,
    });
  }

  return true;
}

function isFeeConfigCorrect(
  vault: StandardWithData | CowcentratedWithData,
  { addRequiredUpdate, feeConfig, globalContext }: VaultValidateContext
) {
  if (vault.status === 'eol') {
    return true;
  }

  const isExpected = vault.beefyFeeConfig === feeConfig;
  const exception = globalContext.options?.vaults.exceptions?.isFeeConfigCorrect?.[vault.id];
  const isException = exception && vault.beefyFeeConfig === exception.value;

  if (isExpected && exception && vault.beefyFeeConfig !== exception.value) {
    pconsole.warn(`Vault ${vault.id}: has an unneeded exception for isFeeConfigCorrect`);
  }

  if (!isExpected && !isException) {
    pconsole.error(
      `Vault ${vault.id}: should update beefy fee config. From: ${vault.beefyFeeConfig} To: ${feeConfig}`
    );

    return addRequiredUpdate(vault.id, 'fix-fee-config-address', {
      from: vault.beefyFeeConfig,
      to: feeConfig,
      strategyAddress: vault.strategy,
      strategyOwner: vault.strategyOwner,
    });
  }

  return true;
}

function isHarvestOnDepositCorrect(
  vault: StandardWithData | CowcentratedWithData,
  { addRequiredUpdate, globalContext }: VaultValidateContext
) {
  if (vault.status === 'eol') {
    return true;
  }

  const isExpected = vault.harvestOnDeposit === true;
  const exception = globalContext.options?.vaults.exceptions?.isHarvestOnDepositCorrect?.[vault.id];
  const isException = exception && vault.harvestOnDeposit === exception.value;

  if (isExpected && exception && vault.harvestOnDeposit !== exception.value) {
    pconsole.warn(`Vault ${vault.id}: has an unneeded exception for isHarvestOnDepositCorrect`);
  }

  if (!isExpected && !isException) {
    pconsole.error(
      `Vault ${vault.id}: should update to harvest on deposit. From: ${vault.harvestOnDeposit} To: true`
    );

    return addRequiredUpdate(vault.id, 'enable-harvest-on-deposit', {
      from: vault.harvestOnDeposit,
    });
  }

  return true;
}

function doesBeefyOracleHaveEntriesForWants(vault: CowcentratedWithData) {
  let success = true;

  const { 0: token0, 1: token1 } = vault.wants;
  const token0HasOracle =
    (vault.subOracle0 && vault.subOracle0[0] && vault.subOracle0[0] !== ZERO_ADDRESS) ||
    (vault.subOracle0FromZero &&
      vault.subOracle0FromZero[0] &&
      vault.subOracle0FromZero[0] !== ZERO_ADDRESS);
  const token1HasOracle =
    (vault.subOracle1 && vault.subOracle1[0] && vault.subOracle1[0] !== ZERO_ADDRESS) ||
    (vault.subOracle1FromZero &&
      vault.subOracle1FromZero[0] &&
      vault.subOracle1FromZero[0] !== ZERO_ADDRESS);

  if (!token0HasOracle) {
    pconsole.error(`${vault.id}: Beefy oracle has no subOracle entry for token0 ${token0}`);
    success = false;
  }
  if (!token1HasOracle) {
    pconsole.error(`${vault.id}: Beefy oracle has no subOracle entry for token1 ${token1}`);
    success = false;
  }

  return success;
}

function isIdValid(vault: AnyVaultWithData, { globalContext }: VaultValidateContext) {
  if (!vault.id) {
    pconsole.error(`[ERROR]: Vault id missing`);
    return false;
  }

  if (globalContext.seenVaultIds.has(vault.id)) {
    pconsole.error(`${vault.id}: Duplicate vault id`);
    return false;
  }

  globalContext.seenVaultIds.add(vault.id);

  // TODO: make stricter add an exceptions for old vaults
  if (!vault.id.match(/^[a-zA-Z0-9-.+\[\]_=]+$/)) {
    pconsole.error(
      `${vault.id}: Vault id invalid, should only contain letters, numbers, hyphens, plus, underscore, square brackets and periods.`
    );
    return false;
  }

  return true;
}

function isEarnedTokenValid(vault: AnyVaultWithData, { seenEarnedTokens }: VaultValidateContext) {
  if (!vault.earnedToken) {
    pconsole.error(`${vault.id}: Missing earnedToken`);
    return false;
  }

  if (seenEarnedTokens.has(vault.earnedToken)) {
    pconsole.error(`${vault.id}: Duplicate earnedToken "${vault.earnedToken}"`);
    return false;
  }

  seenEarnedTokens.add(vault.id);

  return true;
}

function isVaultEarnedTokenAddressValid(
  vault: StandardWithData | CowcentratedWithData,
  { seenEarnedTokenAddresses }: VaultValidateContext
) {
  if (!vault.earnedTokenAddress) {
    pconsole.error(`${vault.id}: Missing earnedTokenAddress`);
    return false;
  }

  if (seenEarnedTokenAddresses.has(vault.earnedTokenAddress)) {
    pconsole.error(`${vault.id}: Duplicate earnedTokenAddress "${vault.earnedTokenAddress}"`);
    return false;
  }

  seenEarnedTokenAddresses.add(vault.id);

  return true;
}

function isGovEarnedTokenAddressValid(vault: GovWithData) {
  const version = vault.version || 1;

  if (version === 1) {
    if (!vault.earnedTokenAddress) {
      pconsole.error(`${vault.id}: ${vault.type} version ${version} missing earnedTokenAddress`);
      return false;
    }
  } else {
    if (!vault.earnedTokenAddress && !vault.earnedTokenAddresses) {
      pconsole.error(
        `${vault.id}: ${vault.type} version ${version} missing earnedTokenAddress or earnedTokenAddresses`
      );
      return false;
    }
  }

  return true;
}

function isEarnedTokenContractAddressSame(vault: AnyVaultWithData) {
  if (vault.earnedTokenAddress !== vault.earnContractAddress) {
    pconsole.error(
      `${vault.id}: earnedTokenAddress not same as earnContractAddress: ${vault.earnedTokenAddress} != ${vault.earnContractAddress}`
    );
    return false;
  }

  return true;
}

function isStrategyTypeIdValid(vault: AnyVaultWithData) {
  if (!vault.strategyTypeId) {
    pconsole.error(`${vault.id}: strategyTypeId missing ${vault.type} strategy type`);
    return false;
  } else if (!doesStrategyTypeIdExistForVaultType(vault.strategyTypeId, vault.type)) {
    pconsole.error(
      `${vault.id}: strategyTypeId invalid, "StrategyDescription-${vault.type}-${vault.strategyTypeId}" not present in locales/en/risks.json`
    );
    return false;
  }

  return true;
}

function isPlatformIdValid(vault: AnyVaultWithData) {
  if (!vault.platformId) {
    pconsole.error(`${vault.id}: platformId missing ${vault.type} platform; see platforms.json`);
    return false;
  } else if (!doesPlatformIdExist(vault.platformId)) {
    pconsole.error(`${vault.id}: platformId "${vault.platformId}" not present in platforms.json`);
    return false;
  }
  return true;
}

function isPlatformIdBeefy(vault: AnyVaultWithData) {
  if (vault.platformId !== 'beefy') {
    pconsole.error(`${vault.id}: platformId should be "beefy" not "${vault.platformId}"`);
    return false;
  }
  return true;
}

function isPlatformIdSameAsCowcentratedTokenProviderId(
  vault: StandardWithData | GovWithData,
  { vaults }: VaultValidateContext
) {
  const clm = vaults.allCowcentrated.find(clm => clm.earnContractAddress === vault.tokenAddress);
  if (!clm) {
    pconsole.error(
      `${vault.id}: CLM ${vault.type === 'gov' ? 'Pool' : 'Vault'} missing underlying CLM`
    );
    return false;
  }

  if (vault.platformId !== clm.tokenProviderId) {
    pconsole.error(
      `${vault.id}: platformId should be "${clm.tokenProviderId}" (tokenProviderId of ${clm.id}) not "${vault.platformId}"`
    );
    return false;
  }

  return true;
}

function isTokenProviderIdSameAsCowcentratedTokenProviderId(
  vault: StandardWithData | GovWithData,
  { vaults }: VaultValidateContext
) {
  const clm = vaults.allCowcentrated.find(clm => clm.earnContractAddress === vault.tokenAddress);
  if (!clm) {
    pconsole.error(
      `${vault.id}: CLM ${vault.type === 'gov' ? 'Pool' : 'Vault'} missing underlying CLM`
    );
    return false;
  }

  if (vault.tokenProviderId !== clm.tokenProviderId) {
    pconsole.error(
      `${vault.id}: tokenProviderId should be "${clm.tokenProviderId}" (tokenProviderId of ${clm.id}) not "${vault.tokenProviderId}"`
    );
    return false;
  }

  return true;
}

function isStrategyTypeIdSameAsCowcentratedStrategyTypeId(
  vault: StandardWithData | GovWithData,
  { vaults }: VaultValidateContext
) {
  const clm = vaults.allCowcentrated.find(clm => clm.earnContractAddress === vault.tokenAddress);
  if (!clm) {
    pconsole.error(
      `${vault.id}: CLM ${vault.type === 'gov' ? 'Pool' : 'Vault'} missing underlying CLM`
    );
    return false;
  }

  if (vault.strategyTypeId !== clm.strategyTypeId) {
    pconsole.error(
      `${vault.id}: strategyTypeId should be "${clm.strategyTypeId}" (strategyTypeId of ${clm.id}) not "${vault.strategyTypeId}"`
    );
    return false;
  }

  return true;
}

function isOracleValid(vault: AnyVaultWithData) {
  if (vault.oracle !== 'lps' && vault.oracle !== 'tokens') {
    pconsole.error(`${vault.id}: oracle "${vault.oracle}" not valid`);
    return false;
  }
  return true;
}

function isOracleIdValid(_vault: AnyVaultWithData) {
  // TODO implement
  return true;
}

function isTokenProviderIdValid(vault: AnyVaultWithData) {
  if (vault.oracle !== 'lps') {
    // only required for LPs, not single asset tokens
    return true;
  }

  if (!vault.tokenProviderId) {
    pconsole.error(`${vault.id}: tokenProviderId missing LP provider platform; see platforms.json`);
    return false;
  } else if (!doesPlatformIdExist(vault.tokenProviderId)) {
    pconsole.error(
      `${vault.id}: tokenProviderId "${vault.tokenProviderId}" not present in platforms.json`
    );
    return false;
  }

  return true;
}

function isTimestampValid(
  vault: AnyVaultWithData,
  field: keyof AnyVaultWithData,
  required: boolean = true
) {
  const value = vault[field];
  if (required && !value) {
    pconsole.error(`${vault.id}: Vault ${field} timestamp missing`);
    return false;
  } else if (value && (typeof value !== 'number' || isNaN(value) || !isFinite(value))) {
    pconsole.error(`${vault.id}: Vault ${field} timestamp wrong type, should be a number`);
    return false;
  }
  return true;
}

function isCreatedAtValid(vault: AnyVaultWithData) {
  return isTimestampValid(vault, 'createdAt');
}

function isRetiredAtValid(vault: AnyVaultWithData) {
  if (vault.status !== 'eol') {
    // only required for EOL vaults
    return true;
  }

  return isTimestampValid(vault, 'retiredAt');
}

function isPausedAtValid(vault: AnyVaultWithData) {
  if (vault.status !== 'paused') {
    // only required for paused vaults
    return true;
  }

  return isTimestampValid(vault, 'pausedAt');
}

function isUpdatedAtValid(vault: AnyVaultWithData) {
  return isTimestampValid(vault, 'updatedAt', false);
}

function isNetworkValid(vault: AnyVaultWithData, { chainId }: VaultValidateContext) {
  const expectedNetwork = addressBookToAppId(chainId);

  if (!vault.network) {
    pconsole.error(`${vault.id}: Missing network, expected "${expectedNetwork}"`);
    return false;
  } else if (vault.network !== expectedNetwork) {
    pconsole.error(
      `${vault.id}: Network mismatch "${vault.network}", expected "${expectedNetwork}"`
    );
    return false;
  }
  return true;
}

function areAssetsValid(vault: AnyVaultWithData, { chainId, globalContext }: VaultValidateContext) {
  if (!vault.assets || !Array.isArray(vault.assets) || !vault.assets.length) {
    pconsole.error(`${vault.id}: Missing assets array`);
    return false;
  }

  let anyMissing = false;
  for (const assetId of vault.assets) {
    if (
      !(assetId in addressBook[chainId].tokens) &&
      !globalContext.options.vaults.assets?.syntheticsNotInAddressBook?.[chainId]?.has(assetId)
    ) {
      if (
        vault.status === 'eol' &&
        globalContext.options.vaults.assets?.missingAllowedForEolCreatedBefore &&
        vault.createdAt <= globalContext.options.vaults.assets?.missingAllowedForEolCreatedBefore
      ) {
        // pconsole.warn(`${vault.id}: Asset "${assetId}" not in addressbook on ${chainId}`);
        continue;
      }

      pconsole.error(`${vault.id}: Asset "${assetId}" not in addressbook on ${chainId}`);
      anyMissing = true;
    }
  }

  return !anyMissing;
}

function doesCowcentratedHavePool(clm: CowcentratedWithData, { vaults }: VaultValidateContext) {
  // Skip EOL pools
  if (clm.status === 'eol') {
    return true;
  }

  const hasPool = vaults.cowcentratedGov.find(
    pool => pool.tokenAddress === clm.earnContractAddress
  );
  if (!hasPool) {
    pconsole.error(`Error: ${clm.id} : CLM missing CLM Pool`);
    return false;
  }

  return true;
}

function doesConfigHaveNoOldFields(
  vault: AnyVaultWithData,
  { globalContext }: VaultValidateContext
) {
  const fieldsToDelete = Object.keys(globalContext.options.vaults.fields.legacy).filter(
    field => field in vault
  );
  if (fieldsToDelete.length) {
    pconsole.error(`${vault.id}: These fields are no longer needed: ${fieldsToDelete.join(', ')}`);
    return false;
  }
  return true;
}

function areAddressesValid(vault: AnyVaultWithData, { globalContext }: VaultValidateContext) {
  const fieldsToChecksum = globalContext.options.vaults.fields.checksum
    .flatMap(field => {
      const address = vault[field];
      if (address === undefined) {
        return undefined;
      }
      if (Array.isArray(address)) {
        return address.map((subAddress, i) =>
          isValidChecksumAddress(subAddress) ? undefined : `${field}[${i}]`
        );
      }
      return isValidChecksumAddress(address) ? undefined : field;
    })
    .filter(isDefined);

  if (fieldsToChecksum.length) {
    pconsole.error(
      `${vault.id}: Invalid/non-checksummed addresses - ${fieldsToChecksum.join(', ')}`
    );
  }

  return true;
}

function isNotZeroSupply(
  vault: StandardWithData | CowcentratedWithData,
  { addRequiredUpdate }: VaultValidateContext
) {
  const totalSupply = new BigNumber(vault.totalSupply || '0');
  if (totalSupply.isZero() || totalSupply.isNaN() || !totalSupply.isFinite()) {
    if (vault.status !== 'eol') {
      pconsole.error(`${vault.id}: ${vault.status} pool is empty`);
      addRequiredUpdate(vault.id, 'remove-empty-vault', {
        earnContractAddress: vault.earnContractAddress,
      });
      return false;
    } else {
      pconsole.warn(`${vault.id}: eol pool is empty`);
    }
  }

  return true;
}

function isRequiredVaultConfigSatisfied(
  vault: AnyVaultWithData,
  { globalContext, addRequiredUpdate }: VaultValidateContext
) {
  const requiredConfigByField = globalContext.options.vaults.fields.required;
  if (!requiredConfigByField) {
    return true;
  }

  const resultsPerField = Object.entries(requiredConfigByField).map(([field, fieldConfig]) => {
    const matching = uniq(
      fieldConfig
        .filter(entry =>
          Object.entries(entry.matching).every(([key, values]) =>
            values.some((value: unknown) => vault[key] === value)
          )
        )
        .map(entry => entry.value)
    );

    if (matching.length === 0) {
      return true;
    }

    if (matching.length > 1) {
      pconsole.error(
        `${vault.id}: Multiple requiredVaultConfig match for ${field}: ${matching.join(', ')}`
      );
      return false;
    }

    const required = matching[0];
    const actual = vault[field];
    if (actual !== required) {
      pconsole.error(
        `${vault.id}: ${field} should be "${required}" not "${actual}" via requiredVaultConfig`
      );
      return addRequiredUpdate(vault.id, 'fix-vault-field', {
        field: field as keyof VaultConfig,
        from: actual,
        to: required,
      });
    }

    return true;
  });

  // only success if all fields do
  return resultsPerField.every(result => result);
}

function arePointsStructureIdsValid(
  vault: AnyVaultWithData,
  { globalContext }: VaultValidateContext
) {
  let success = true;

  if (vault.pointStructureIds && vault.pointStructureIds.length > 0) {
    const invalidPointStructureIds = vault.pointStructureIds!.filter(
      p => !globalContext.options.points.providerById.has(p)
    );
    if (invalidPointStructureIds.length > 0) {
      pconsole.error(
        `${vault.id}: pointStructureIds ${invalidPointStructureIds} not present in points.json`
      );
      success = false;
    }
  }

  // check for the provider eligibility
  for (const pointProvider of globalContext.options.points.providerById.values()) {
    const hasProvider = vault.pointStructureIds?.includes(pointProvider.id) ?? false;

    const shouldHaveProviderArr: boolean[] = [];
    for (const eligibility of pointProvider.eligibility) {
      if (eligibility.type === 'token-by-provider') {
        if (!('tokens' in eligibility)) {
          throw new Error(`Error: ${pointProvider.id} : eligibility.tokens missing`);
        }
        if (!('tokenProviderId' in eligibility)) {
          throw new Error(`Error: ${pointProvider.id} : eligibility.tokenProviderId missing`);
        }

        shouldHaveProviderArr.push(
          (vault.tokenProviderId === eligibility.tokenProviderId &&
            vault.assets?.some(a => eligibility.tokens?.includes(a))) ??
            false
        );
      } else if (eligibility.type === 'token-on-platform') {
        if (!('tokens' in eligibility)) {
          throw new Error(`Error: ${pointProvider.id} : eligibility.tokens missing`);
        }
        if (!('platformId' in eligibility)) {
          throw new Error(`Error: ${pointProvider.id} : eligibility.platformId missing`);
        }

        shouldHaveProviderArr.push(
          (eligibility.platformId === vault.platformId &&
            vault.assets?.some(a => eligibility.tokens.includes(a))) ??
            false
        );
      } else if (eligibility.type === 'token-holding') {
        if (!('tokens' in eligibility)) {
          throw new Error(`Error: ${pointProvider.id} : eligibility.tokens missing`);
        }

        shouldHaveProviderArr.push(
          vault.assets?.some(a => eligibility?.tokens?.includes(a)) ?? false
        );
      } else if (eligibility.type === 'on-chain-lp') {
        if (!('chain' in eligibility)) {
          throw new Error(`Error: ${pointProvider.id} : eligibility.chain missing`);
        }

        shouldHaveProviderArr.push(vault.network === eligibility.chain);
      } else if (eligibility.type === 'earned-token-name-regex') {
        if (!('regex' in eligibility)) {
          throw new Error(`Error: ${pointProvider.id} : eligibility.regex missing`);
        }
        const earnedToken = vault.earnedToken;
        const regex = new RegExp(eligibility.regex as string);
        shouldHaveProviderArr.push(regex.test(earnedToken));
      } else if (eligibility.type === 'vault-whitelist') {
        shouldHaveProviderArr.push(hasProvider);
      }
    }

    // bool or
    const shouldHaveProvider = shouldHaveProviderArr.some(Boolean);

    if (shouldHaveProvider && !hasProvider) {
      pconsole.error(
        `${vault.id}: pointStructureId ${pointProvider.id} should be present in pointStructureIds`
      );
      success = false;
    } else if (!shouldHaveProvider && hasProvider) {
      pconsole.error(
        `${vault.id}: pointStructureId ${pointProvider.id} should NOT be present in pointStructureIds`
      );
      success = false;
    }
  }

  return success;
}
