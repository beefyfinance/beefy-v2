import { addressBook } from 'blockchain-addressbook';
import { getVaultsIntegrity } from './common/exclude';
import {
  AddressBookChainId,
  chainIds,
  excludeChains,
  excludedChainIds,
  getBoostsForChain,
} from './common/config';
import partners from '../src/config/boost/partners.json';
import campaigns from '../src/config/boost/campaigns.json';
import { fetchVaults } from './validate/vault/data';
import { GlobalValidateContext, VaultValidateContext } from './validate/required-updates-types';
import { ChainValidateResult } from './validate/chain-types';
import { RequiredUpdates } from './validate/required-updates';
import { ValidationOptions } from './validate/options-types';
import { vaultValidators } from './validate/vault/validators';
import { VaultValidatorsCheck } from './validate/vault/validators-types';
import { VaultGroups } from './validate/vault/data-types';
import { buildOptions } from './validate/options';
import { isPlatformConfigValid } from './validate/platform/validators';
import { pconsole } from './common/pconsole';

/**
 * Everything should be configurable from this object
 * It is a bit more verbose as we:
 *  - don't skip on `undefined` values
 *  - nor, allow owners on one exceptional contract to be valid for all contracts on the same chain
 *  - and, add reasons for exceptions (please maintain these)
 * The list of validators run for each vault type is specified in vault/validators.ts
 * @see vaultValidators
 */
const options: ValidationOptions = buildOptions({
  vaults: {
    // Additional owners valid for all vaults on a chain
    additionalVaultOwners: {
      fantom: ['devMultisig'],
      polygon: ['devMultisig'],
      arbitrum: ['devMultisig'],
    },
    // Can skip validators for specific chains/groups
    skip: {
      allStandard: {
        isHarvestOnDepositCorrect: {
          chains: new Set(['ethereum', 'avax', 'rootstock']),
        },
      },
    },
    // Custom expected results for specific vaults / validators
    exceptions: {
      isHarvestOnDepositCorrect: {
        'bifi-vault': { value: false, reason: 'Please add a reason' },
        'swapbased-usd+-usdbc': { value: false, reason: 'Please add a reason' },
        'swapbased-dai+-usd+': { value: false, reason: 'Please add a reason' },
        'equilibria-arb-silo-usdc.e': { value: false, reason: 'Please add a reason' },
        'silo-eth-pendle-weeth': { value: false, reason: 'Please add a reason' },
        'pancake-cow-arb-usdt+-usd+-vault': { value: false, reason: 'Please add a reason' },
        'compound-op-eth': { value: false, reason: 'Please add a reason' },
        'nuri-cow-scroll-usdc-scr-vault': { value: false, reason: 'Please add a reason' },
        'aero-cow-eurc-usdc-vault': { value: false, reason: 'Please add a reason' },
        'venus-bnb': { value: false, reason: 'Please add a reason' },
        'aero-cow-eurc-cbbtc-vault': { value: false, reason: 'BTC decimals' },
        'pendle-eqb-arb-dwbtc-26jun25': { value: false, reason: 'BTC decimals' },
        'pendle-arb-dwbtc-26jun25': { value: false, reason: 'BTC decimals' },
        'tokan-wbtc-weth': { value: false, reason: 'BTC decimals' },
        'aero-cow-usdz-cbbtc-vault': { value: false, reason: 'BTC decimals' },
        'aero-cow-weth-cbbtc-vault': { value: false, reason: 'BTC decimals' },
        'aero-cow-usdc-cbbtc-vault': { value: false, reason: 'BTC decimals' },
        'silo-op-tbtc-tbtc': { value: false, reason: 'BTC decimals' },
        'sushi-cow-arb-wbtc-tbtc-vault': { value: false, reason: 'BTC decimals' },
        'png-wbtc.e-usdc': { value: false, reason: 'BTC decimals' },
      },
      isStrategyOwnerCorrect: {
        'bifi-maxi-eol': {
          value: '0x77BA75A9a95b5aB756749fF5519aC40Ed4AAb486',
          reason: 'Please add a reason',
        },
        'bunny-bunny-eol': {
          value: '0x0000000000000000000000000000000000000000',
          reason: 'BSC no owner',
        },
        'cake-syrup-twt': {
          value: undefined,
          reason: 'BSC old strategy with no privileged methods',
        },
        'fortube-btcb': { value: undefined, reason: 'BSC old strategy with no privileged methods' },
        'fortube-busd': { value: undefined, reason: 'BSC old strategy with no privileged methods' },
        'fortube-dot': { value: undefined, reason: 'BSC old strategy with no privileged methods' },
        'fortube-fil': { value: undefined, reason: 'BSC old strategy with no privileged methods' },
        'fortube-usdt': { value: undefined, reason: 'BSC old strategy with no privileged methods' },
        'fry-burger-v1': {
          value: undefined,
          reason: 'BSC old strategy with no privileged methods',
        },
        'fry-burger-v2': {
          value: undefined,
          reason: 'BSC old strategy with no privileged methods',
        },
      },
      isVaultOwnerCorrect: {
        'cake-busd-bnb': { value: undefined, reason: 'BSC old vault with no privileged methods' },
        'cake-cake-bnb-eol': {
          value: undefined,
          reason: 'BSC old vault with no privileged methods',
        },
        'cake-cake-eol': { value: undefined, reason: 'BSC old vault with no privileged methods' },
        'cake-hard': { value: undefined, reason: 'BSC old vault with no privileged methods' },
        'cake-syrup-twt': { value: undefined, reason: 'BSC old vault with no privileged methods' },
        'cake-twt': { value: undefined, reason: 'BSC old vault with no privileged methods' },
        'cake-usdt-busd': { value: undefined, reason: 'BSC old vault with no privileged methods' },
        'fortube-btcb': { value: undefined, reason: 'BSC old vault with no privileged methods' },
        'fortube-busd': { value: undefined, reason: 'BSC old vault with no privileged methods' },
        'fortube-dot': { value: undefined, reason: 'BSC old vault with no privileged methods' },
        'fortube-fil': { value: undefined, reason: 'BSC old vault with no privileged methods' },
        'fortube-usdt': { value: undefined, reason: 'BSC old vault with no privileged methods' },
        'fry-burger-v1': { value: undefined, reason: 'BSC old vault with no privileged methods' },
        'fry-burger-v2': { value: undefined, reason: 'BSC old vault with no privileged methods' },
        'beltv2-4belt': {
          value: '0x654AC60246c9B7E35f0F51f116D67EbC0a956d09',
          reason: 'BSC Moonpot deployer',
        },
      },
      isRewardPoolOwnerCorrect: {
        'cronos-bifi-gov': {
          value: '0xF9eBb381dC153D0966B2BaEe776de2F400405755',
          reason: 'Cronos BeefyFeeBatchV3',
        },
        'fantom-bifi-gov': {
          value: '0x35F43b181957824f2b5C0EF9856F85c90fECb3c8',
          reason: 'Fantom BeefyFeeBatchV3',
        },
        'metis-bifi-gov': {
          value: '0x2cC364255206A7e14bF59ADB1fc5770DbA48CB3f',
          reason: 'Metis BeefyFeeBatchV3',
        },
        'avax-bifi-gov': {
          value: '0x48beD04cBC52B5676C04fa94be5786Cdc9f266f5',
          reason: 'Avax BeefyFeeBatchV3',
        },
        'beefy-beJoe-earnings': {
          value: '0xc1464638B11b9BAac9525cf7bF2B4A52Ccbde885',
          reason: 'Avax JoeBatch',
        },
        'moonbeam-bifi-gov': {
          value: '0x00AeC34489A7ADE91A0507B6b9dBb0a50938B7c0',
          reason: 'Moonbeam BeefyFeeBatchV3',
        },
        'beefy-beqi-earnings': {
          value: '0x97bfa4b212A153E15dCafb799e733bc7d1b70E72',
          reason: 'Polygon BeefyQI',
        },
        'polygon-bifi-gov': {
          value: '0x7313533ed72D2678bFD9393480D0A30f9AC45c1f',
          reason: 'Polygon BeefyFeeBatchV3',
        },
        'arbi-bifi-gov': {
          value: '0xFEd99885fE647dD44bEA2B375Bd8A81490bF6E0f',
          reason: 'Arbitrum BeefyFeeBatchV3',
        },
        'bifi-pool': {
          value: addressBook.ethereum.platforms.beefyfinance.strategyOwner,
          reason: 'Ethereum strategyOwner',
        },
        'ethereum-bifi-gov': {
          value: '0x8237f3992526036787E8178Def36291Ab94638CD',
          reason: 'Ethereum BeefyFeeBatchV3UniV3',
        },
        'bifi-gov': {
          value: '0xAb4e8665E7b0E6D83B65b8FF6521E347ca93E4F8',
          reason: 'BSC BeefyFeeBatchV3',
        },
        'bifi-gov-eol': {
          value: '0x0000000000000000000000000000000000000000',
          reason: 'BSC no owner',
        },
        'beefy-beopx-earnings': {
          value: '0xEDFBeC807304951785b581dB401fDf76b4bAd1b0',
          reason: 'Optimism BeefyOPX',
        },
        'optimism-bifi-gov': {
          value: '0x3Cd5Ae887Ddf78c58c9C1a063EB343F942DbbcE8',
          reason: 'Optimism BeefyFeeBatchV3SolidlyRouter',
        },
        'kava-bifi-gov': {
          value: '0xF0d26842c3935A618e6980C53fDa3A2D10A02eb7',
          reason: 'Kava ???',
        },
      },
      isFeeConfigCorrect: {
        'boo-boo-ftm': { value: undefined, reason: 'Fantom strategy predates feeConfig' },
        'boo-mim-ftm': { value: undefined, reason: 'Fantom strategy predates feeConfig' },
        'boo-wftm-beets': { value: undefined, reason: 'Fantom strategy predates feeConfig' },
        'boo-wftm-brush': { value: undefined, reason: 'Fantom strategy predates feeConfig' },
        'boo-wftm-spell': { value: undefined, reason: 'Fantom strategy predates feeConfig' },
        'wigo-wigo': { value: undefined, reason: 'Fantom strategy predates feeConfig' },
        'wigo-wigo-ftm': { value: undefined, reason: 'Fantom strategy predates feeConfig' },
        'netswap-m.usdt-m.usdc': { value: undefined, reason: 'Metis strategy predates feeConfig' },
        'netswap-metis-m.usdc': { value: undefined, reason: 'Metis strategy predates feeConfig' },
        'netswap-nett-metis': { value: undefined, reason: 'Metis strategy predates feeConfig' },
        'netswap-weth-metis': { value: undefined, reason: 'Metis strategy predates feeConfig' },
        'vvs-cro-atom': { value: undefined, reason: 'Cronos strategy predates feeConfig' },
        'vvs-cro-btc': { value: undefined, reason: 'Cronos strategy predates feeConfig' },
        'vvs-cro-doge': { value: undefined, reason: 'Cronos strategy predates feeConfig' },
        'vvs-cro-eth': { value: undefined, reason: 'Cronos strategy predates feeConfig' },
        'vvs-cro-shib': { value: undefined, reason: 'Cronos strategy predates feeConfig' },
        'vvs-cro-usdc': { value: undefined, reason: 'Cronos strategy predates feeConfig' },
        'vvs-cro-usdt': { value: undefined, reason: 'Cronos strategy predates feeConfig' },
        'vvs-tonic-cro': { value: undefined, reason: 'Cronos strategy predates feeConfig' },
        'vvs-usdt-usdc': { value: undefined, reason: 'Cronos strategy predates feeConfig' },
        'vvs-vvs': { value: undefined, reason: 'Cronos strategy predates feeConfig' },
        'vvs-vvs-cro': { value: undefined, reason: 'Cronos strategy predates feeConfig' },
        'vvs-vvs-usdc': { value: undefined, reason: 'Cronos strategy predates feeConfig' },
        'vvs-vvs-usdt': { value: undefined, reason: 'Cronos strategy predates feeConfig' },
        'joe-joe': { value: undefined, reason: 'Avax strategy predates feeConfig' },
        'stellaswap-well-wglmr': {
          value: undefined,
          reason: 'Moonbeam strategy predates feeConfig',
        },
        'curve-op-f-susd': { value: undefined, reason: 'Optimism strategy predates feeConfig' },
        'velodrome-usdc-dola': { value: undefined, reason: 'Optimism strategy predates feeConfig' },
        'velodrome-velo-op': { value: undefined, reason: 'Optimism strategy predates feeConfig' },
      },
      isFeeRecipientCorrect: {
        'ethereum-vault': {
          value: '0x8237f3992526036787E8178Def36291Ab94638CD',
          reason: 'Ethereum BeefyFeeBatchV3UniV3',
        },
        'bifi-vault': {
          value: '0x8237f3992526036787E8178Def36291Ab94638CD',
          reason: 'Ethereum BeefyFeeBatchV3UniV3',
        },
      },
    },
    assets: {
      missingAllowedForEolCreatedBefore: 1675694667, // 2023-06-02T14:44:27+00:00
      syntheticsNotInAddressBook: {
        arbitrum: new Set(['NEAR', 'ATOM', 'BNB', 'LTC', 'XRP', 'DOGE']),
      },
    },
    fields: {
      required: {
        // Ensure CLM strategies are correct; additional check ensure that CLM Pool/Vault match the base CLM
        strategyTypeId: [
          {
            value: 'compounds',
            matching: {
              type: ['cowcentrated'],
              tokenProviderId: [
                'uniswap',
                'sushi',
                'thena',
                'camelot',
                'stellaswap',
                'baseswap',
                'oku',
                'kim',
                'dragon',
                'ramses', // compounds and also sends to reward pool
                'pharaoh', // compounds and also sends to reward pool
                'nile', // compounds and also sends to reward pool
                'pancakeswap', // compounds and also sends to reward pool
                'nuri', // compounds and also sends to reward pool
              ],
            },
          },
          {
            value: 'pool',
            matching: {
              type: ['cowcentrated'],
              tokenProviderId: ['velodrome', 'aerodrome'],
            },
          },
        ],
      },
      legacy: {
        tokenDescription: 'Use addressbook',
        tokenDescriptionUrl: 'Use addressbook',
        pricePerFullShare: 'Not required',
        tvl: 'Not required',
        oraclePrice: 'Not required',
        platform: 'Use platformId',
        stratType: 'Use strategyTypeId',
        logo: 'Not required',
        depositsPaused: 'Use status: paused',
        withdrawalFee: 'Not required (use api)',
        updatedFees: 'Not required',
        mintTokenUrl: 'Use minters config',
        callFee: 'Not required (use api)',
        tokenAmmId: 'Use zap: VaultZapConfig if needed',
        isGovVault: 'Use type: gov',
      },
      checksum: [
        'tokenAddress',
        'earnedTokenAddress',
        'earnContractAddress',
        'depositTokenAddresses',
      ],
    },
  },
});

type CliOptions = {
  verbose: boolean;
  noColor: boolean;
};

async function validateEverything({
  verbose = false,
  noColor = false,
}: CliOptions): Promise<number> {
  const globalContext: GlobalValidateContext = {
    options,
    seenVaultIds: new Set<string>(),
    requiredUpdates: new RequiredUpdates(),
    verbose,
  };

  if (noColor) {
    pconsole.disableColor();
  }

  let exitCode = (
    await Promise.all([
      // Vaults + Boosts
      validatePools(globalContext),
      // Platform config
      validatePlatformConfig(globalContext),
    ])
  ).reduce((prev, curr) => Math.max(prev, curr), 0);

  if (globalContext.requiredUpdates.hasAny()) {
    exitCode = exitCode === 0 ? 1 : exitCode;
    globalContext.requiredUpdates.prettyPrint();
  }

  return exitCode;
}

// Vaults + Boosts
async function validatePools(globalContext: GlobalValidateContext): Promise<number> {
  let exitCode: number = 0;

  if (!(await areExcludedChainsUnchanged())) {
    return 1;
  }

  const chainResults = await Promise.allSettled(
    chainIds.map(chainId => validateChainPools(chainId, globalContext))
  );
  let invalidChains = 0;
  for (let i = 0; i < chainResults.length; ++i) {
    const chainResult = chainResults[i];
    const chainId = chainIds[i];

    if (chainResult.status === 'rejected') {
      invalidChains++;
      pconsole.error(`Error: ${chainId} threw while attempting to validate:`, chainResult.reason);
      exitCode = 1;
      continue;
    }

    const result = chainResult.value;
    if (!result.success) {
      invalidChains++;
      pconsole.error(`Error: ${chainId} failed to validate.`);
      exitCode = 1;
    }
  }

  if (invalidChains > 0) {
    pconsole.error(`${invalidChains}/${chainIds.length} chains failed validation.`);
  }

  if (excludedChainIds.length > 0) {
    pconsole.log(`*** Excluded chains: ${excludedChainIds.join(', ')} ***`);
  }

  if (exitCode === 0) {
    pconsole.success('Validated successfully.');
  } else {
    pconsole.error('Validation failed.');
  }

  return exitCode;
}

async function areExcludedChainsUnchanged() {
  let isUnchanged = true;

  if (excludedChainIds.length > 0) {
    pconsole.log(`*** Excluded chains: ${excludedChainIds.join(', ')} ***`);
    const integrities = await Promise.all(
      excludedChainIds.map(chainId => getVaultsIntegrity(chainId))
    );
    excludedChainIds.forEach((chainId, i) => {
      const integrityNow = integrities[i];
      const integrityThen = excludeChains[chainId];

      if (!integrityThen) {
        pconsole.error(`Missing integrity data for excluded chain ${chainId}`);
        isUnchanged = false;
        return;
      }

      if (!integrityNow) {
        pconsole.error(`Failed to perform integrity check for excluded chain ${chainId}`);
        isUnchanged = false;
        return;
      }

      if (integrityNow.count !== integrityThen.count) {
        pconsole.error(
          `Vault count changed for excluded chain ${chainId}: ${integrityThen.count} -> ${integrityNow.count}`
        );
        isUnchanged = false;
        return;
      }

      if (integrityNow.hash !== integrityThen.hash) {
        pconsole.error(
          `Vault hash changed for excluded chain ${chainId}: ${integrityThen.hash} -> ${integrityNow.hash}`
        );
        isUnchanged = false;
        return;
      }

      pconsole.success(`Excluded chain ${chainId} integrity check passed`);
    });

    if (!isUnchanged) {
      pconsole.error('*** Excluded chain integrity check failed ***');
      pconsole.error('If you removed a vault, update excludeChains in scripts/common/config.ts');
      return isUnchanged;
    }
  }

  return isUnchanged;
}

async function validateChainPools(
  chainId: AddressBookChainId,
  globalContext: GlobalValidateContext
): Promise<ChainValidateResult> {
  let success = true;
  const [vaults, boostConfigs] = await Promise.all([
    fetchVaults(chainId),
    getBoostsForChain(chainId),
  ]);

  //
  // Vaults
  //
  const { vaultIds, summary } = vaults.all.reduce(
    (prev, vault) => {
      prev.vaultIds.add(vault.id);
      prev.summary.all.total += 1;
      prev.summary[vault.type].total += 1;
      prev.summary.all[vault.status] += 1;
      prev.summary[vault.type][vault.status] += 1;

      return prev;
    },
    {
      vaultIds: new Set<string>(),
      summary: {
        standard: { active: 0, eol: 0, paused: 0, total: 0 },
        gov: { active: 0, eol: 0, paused: 0, total: 0 },
        cowcentrated: { active: 0, eol: 0, paused: 0, total: 0 },
        all: { active: 0, eol: 0, paused: 0, total: 0 },
      },
    }
  );

  const { beefyFeeRecipient, beefyFeeConfig } = addressBook[chainId].platforms.beefyfinance;

  const context: VaultValidateContext = {
    globalContext: globalContext,
    seenEarnedTokens: new Set(),
    seenEarnedTokenAddresses: new Set(),
    addRequiredUpdate: globalContext.requiredUpdates.makeChainAddFunction(chainId),
    chainId,
    vaults,
    vaultOwners: globalContext.options.vaults.vaultOwners[chainId],
    rewardPoolOwners: globalContext.options.vaults.rewardPoolOwners[chainId],
    strategyOwners: globalContext.options.vaults.strategyOwners[chainId],
    strategyKeepers: globalContext.options.vaults.strategyKeepers[chainId],
    feeRecipient: beefyFeeRecipient,
    feeConfig: beefyFeeConfig,
  };

  const genericVaultValidators = vaultValidators as VaultValidatorsCheck;
  for (const group of Object.keys(genericVaultValidators)) {
    const validateFunctions = genericVaultValidators[group as keyof VaultValidatorsCheck];
    if (!validateFunctions) {
      continue;
    }
    const vaultsToValidate = vaults[group as keyof VaultGroups];
    if (!vaultsToValidate.length) {
      continue;
    }

    for (const [validateName, validateFn] of Object.entries(validateFunctions)) {
      if (globalContext.options.vaults.skip?.[group]?.[validateName]?.chains?.has(chainId)) {
        pconsole.info(`Skipping validator ${validateName} for ${group} on ${chainId}`);
        continue;
      }

      for (const vault of vaultsToValidate) {
        const isValid = validateFn(vault, context);
        if (!isValid) {
          success = false;
        }
        if (globalContext.verbose) {
          pconsole.dim(`${chainId} ${group} ${vault.id} ${validateName}: ${isValid ? '✔️' : '❌'}`);
        }
      }
    }
  }

  //
  // Boosts
  // TODO refactor similar to vaults
  //
  const seenBoostIds = new Set();
  boostConfigs.forEach(boost => {
    if (seenBoostIds.has(boost.id)) {
      pconsole.error(`Error: Boost ${boost.id}: Boost id duplicated: ${boost.id}`);
      success = false;
    }
    seenBoostIds.add(boost.id);

    if (!vaultIds.has(boost.poolId)) {
      pconsole.error(`Error: Boost ${boost.id}: Boost has non-existent pool id ${boost.poolId}.`);
      success = false;
      return;
    }

    if ((boost.partners || []).length === 0 && !boost.campaign) {
      pconsole.error(`Error: Boost ${boost.id}: Boost has no partners or campaign.`);
      success = false;
      return;
    }

    if (boost.partners && boost.partners.length) {
      const invalidPartners = boost.partners.filter(partner => !(partner in partners));
      if (invalidPartners.length) {
        pconsole.error(`Error: Boost ${boost.id}: Missing partners: ${invalidPartners.join(', ')}`);
        success = false;
        return;
      }
    }

    if (boost.campaign && !(boost.campaign in campaigns)) {
      pconsole.error(`Error: Boost ${boost.id}: Missing campaign: ${boost.campaign}`);
      success = false;
      return;
    }

    if (boost.assets && boost.assets.length) {
      for (const assetId of boost.assets) {
        if (!assetId?.trim().length) {
          pconsole.error(`Error: Boost ${boost.id}: Asset id is empty`);
          success = false;
        }
        // TODO need to tidy up old boosts before we can enable this
        // if (!(assetId in addressBook[chainId].tokens)) {
        //   pconsole.error(`Error: Boost ${boost.id}: Asset "${assetId}" not in addressbook on ${chainId}`);
        //   success = false;
        // }
      }
    }

    const earnedVault = vaults.all.find(
      pool => pool.earnContractAddress === boost.earnedTokenAddress
    );
    if (earnedVault) {
      if (boost.earnedTokenDecimals !== 18) {
        pconsole.error(
          `Error: Boost ${boost.id}: Earned token decimals mismatch ${boost.earnedTokenDecimals} != 18`
        );
        success = false;
        return;
      }
      // TODO oracle etc
    } else {
      const earnedToken = addressBook[chainId].tokens[boost.earnedToken];
      if (!earnedToken) {
        // TODO need to tidy up old boosts before we can enable this
        // pconsole.error(`Error: Boost ${boost.id}: Earned token ${boost.earnedToken} not in addressbook`);
        // success = false;
        return;
      }

      if (earnedToken.address !== boost.earnedTokenAddress) {
        pconsole.error(
          `Error: Boost ${boost.id}: Earned token address mismatch ${boost.earnedTokenAddress} != ${earnedToken.address}`
        );
        success = false;
        return;
      }

      if (earnedToken.decimals !== boost.earnedTokenDecimals) {
        pconsole.error(
          `Error: Boost ${boost.id}: Earned token decimals mismatch ${boost.earnedTokenDecimals} != ${earnedToken.decimals}`
        );
        success = false;
        return;
      }

      if (earnedToken.oracleId !== boost.earnedOracleId) {
        pconsole.error(
          `Error: Boost ${boost.id}: Earned token oracle id mismatch ${boost.earnedOracleId} != ${earnedToken.oracleId}`
        );
        success = false;
        return;
      }
    }
  });

  if (globalContext.requiredUpdates.hasChain(chainId)) {
    success = false;
  }

  pconsole.dim(`${chainId} active pools: ${summary.all.active}/${vaults.all.length}`);

  return { success, summary };
}

// Platform config
async function validatePlatformConfig(_globalContext: GlobalValidateContext): Promise<number> {
  if (!(await isPlatformConfigValid())) {
    return 1;
  }

  return 0;
}

validateEverything({
  verbose: process.argv.includes('--verbose'),
  noColor: process.argv.includes('--no-color'),
})
  .then(exitCode => process.exit(exitCode))
  .catch(err => {
    pconsole.error(err);
    process.exit(-1);
  });
