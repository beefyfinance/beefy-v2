import { addressBook } from 'blockchain-addressbook';
import BigNumber from 'bignumber.js';
import chalk from 'chalk';
import { isValidChecksumAddress, maybeChecksumAddress } from './common/utils.ts';
import { getVaultsIntegrity } from './common/exclude.ts';
import {
  type AddressBookChainId,
  addressBookToAppId,
  chainIds,
  type ChainMap,
  excludeChains,
  excludedChainIds,
  getPromosForChain,
  getVaultsForChain,
} from './common/config.ts';
import { getStrategyIds } from './common/strategies.ts';
import { StratAbi } from '../src/config/abi/StrategyAbi.ts';
import { StandardVaultAbi } from '../src/config/abi/StandardVaultAbi.ts';
import platforms from '../src/config/platforms.json';
import partners from '../src/config/promos/partners.json';
import campaigns from '../src/config/promos/campaigns.json';
import pointProviders from '../src/config/points.json';
import type { PlatformType, VaultConfig } from '../src/features/data/apis/config-types.ts';
import { partition } from 'lodash-es';
import i18keys from '../src/locales/en/main.json';
import { fileExists } from './common/files.ts';
import { isEmpty } from '../src/helpers/utils.ts';
import { keys } from '../src/helpers/object.ts';
import { sleep } from '../src/features/data/utils/async-utils.ts';
import { getViemClient } from './common/viem.ts';
import {
  type Abi,
  type Address,
  ContractFunctionExecutionError,
  ContractFunctionRevertedError,
  getContract,
  type PublicClient,
} from 'viem';
import { SCORED_RISKS } from '../src/config/risk.ts';

const overrides: Record<
  string,
  { [K in keyof Omit<VaultConfigWithStrategyData, keyof VaultConfig>]?: undefined }
> = {
  'bunny-bunny-eol': { keeper: undefined, stratOwner: undefined },
  'bifi-maxi': { stratOwner: undefined }, // harvester 0xDe30
  'beltv2-4belt': { vaultOwner: undefined }, // moonpot deployer
  'bifi-vault': { beefyFeeRecipient: undefined }, // TODO: remove
  'aero-cow-eurc-cbbtc-vault': { harvestOnDeposit: undefined },
  'compound-base-eth': { harvestOnDeposit: undefined },
  'beefy-besonic': { vaultOwner: undefined }, // temp disabled while waiting for rewards to refill
};

const oldValidOwners = [
  addressBook.fantom.platforms.beefyfinance.devMultisig,
  addressBook.polygon.platforms.beefyfinance.devMultisig,
  addressBook.arbitrum.platforms.beefyfinance.devMultisig,
];

const oldValidFeeRecipients: ChainMap<Address[]> = {};

const oldValidRewardPoolOwners: ChainMap<Address[]> = {
  polygon: [
    '0x7313533ed72D2678bFD9393480D0A30f9AC45c1f',
    '0x97bfa4b212A153E15dCafb799e733bc7d1b70E72',
  ],
  metis: ['0x2cC364255206A7e14bF59ADB1fc5770DbA48CB3f'],
  cronos: ['0xF9eBb381dC153D0966B2BaEe776de2F400405755'],
  moonbeam: ['0x00AeC34489A7ADE91A0507B6b9dBb0a50938B7c0'],
  ethereum: [
    '0x1c9270ac5C42E51611d7b97b1004313D52c80293',
    '0x8237f3992526036787E8178Def36291Ab94638CD',
  ],
  avax: [
    '0x48beD04cBC52B5676C04fa94be5786Cdc9f266f5',
    '0xc1464638B11b9BAac9525cf7bF2B4A52Ccbde885',
  ],
  arbitrum: ['0xFEd99885fE647dD44bEA2B375Bd8A81490bF6E0f'],
  bsc: ['0xAb4e8665E7b0E6D83B65b8FF6521E347ca93E4F8', '0x0000000000000000000000000000000000000000'],
  optimism: [
    '0xEDFBeC807304951785b581dB401fDf76b4bAd1b0',
    '0x3Cd5Ae887Ddf78c58c9C1a063EB343F942DbbcE8',
  ],
};

const nonHarvestOnDepositChains = ['ethereum', 'avax', 'rootstock'];
const nonHarvestOnDepositPools = [
  'aero-cow-weth-cbbtc-vault',
  'aero-cow-usdc-cbbtc-vault',
  'compound-op-usdt',
  'compound-op-usdc',
  'compound-op-eth',
  'compound-base-usdc',
  'compound-base-aero',
  'aero-cow-eurc-usdc-vault',
  'compound-polygon-usdc',
  'shadow-cow-sonic-wbtc-usdc.e-vault',
  'shadow-cow-sonic-wbtc-weth-vault',
  'shadow-cow-sonic-ws-bes-vault',
];
const excludedAbPools = [
  'gmx-arb-near-usdc',
  'gmx-arb-atom-usdc',
  'gmx-arb-xrp-usdc',
  'gmx-arb-doge-usdc',
];
const addressFields: Array<keyof VaultConfig> = [
  'tokenAddress',
  'earnedTokenAddress',
  'earnContractAddress',
];

const validPlatformIds = platforms.map(platform => platform.id);
const validStrategyIds = getStrategyIds();
const validPointProviderIds = pointProviders.map(pointProvider => pointProvider.id);
const validRisks = new Set(Object.keys(SCORED_RISKS));

const oldFields: Record<string, string> = {
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
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Updates = Record<string, Record<string, any>>;

const validatePools = async () => {
  let exitCode = 0;
  const updates: ChainMap<Updates> = {};
  const uniquePoolId = new Set<string>();

  if (excludedChainIds.length > 0) {
    console.warn(`*** Excluded chains: ${excludedChainIds.join(', ')} ***`);
    const integrities = await Promise.all(
      excludedChainIds.map(chainId => getVaultsIntegrity(chainId))
    );
    excludedChainIds.forEach((chainId, i) => {
      const integrityNow = integrities[i];
      const integrityThen = excludeChains[chainId];

      if (!integrityThen) {
        console.error(`Missing integrity data for excluded chain ${chainId}`);
        exitCode = 1;
        return;
      }

      if (!integrityNow) {
        console.error(`Failed to perform integrity check for excluded chain ${chainId}`);
        exitCode = 1;
        return;
      }

      if (integrityNow.count !== integrityThen.count) {
        console.error(
          `Vault count changed for excluded chain ${chainId}: ${integrityThen.count} -> ${integrityNow.count}`
        );
        exitCode = 1;
        return;
      }

      if (integrityNow.hash !== integrityThen.hash) {
        console.error(
          `Vault hash changed for excluded chain ${chainId}: ${integrityThen.hash} -> ${integrityNow.hash}`
        );
        exitCode = 1;
        return;
      }

      // console.log(`Excluded chain ${chainId} integrity check passed`);
    });

    if (exitCode !== 0) {
      console.error('*** Excluded chain integrity check failed ***');
      console.error('If you removed a vault, update excludeChains in scripts/common/config.ts');
      return exitCode;
    }
  }

  const platformExitCode = await validatePlatformTypes();
  if (platformExitCode !== 0) {
    exitCode = platformExitCode;
  }

  const validated: AddressBookChainId[] = [];
  const promises = chainIds.map(chainId =>
    validateSingleChain(chainId, uniquePoolId).finally(() => {
      validated.push(chainId);
      const toValidate = chainIds.filter(c => !validated.includes(c));
      if (toValidate.length > 0) console.log(chalk.gray(`Validating: ${toValidate}...`));
    })
  );
  const results = await Promise.all(promises);

  exitCode = results.reduce((acum, cur) => (acum + cur.exitCode > 0 ? 1 : 0), exitCode);
  results.forEach(res => {
    if (!isEmpty(res.updates)) {
      updates[res.chainId] = res.updates;
    }
  });

  // Helpful data structures to correct addresses.
  console.log('Required updates:', JSON.stringify(updates));
  console.log('Valid:', exitCode === 0 && Object.keys(updates).length === 0);

  return exitCode;
};

const validateSingleChain = async (chainId: AddressBookChainId, uniquePoolId: Set<string>) => {
  const vaultsAndPromos = await Promise.all([
    getVaultsForChain(chainId),
    getPromosForChain(chainId),
  ]);
  const allVaults = vaultsAndPromos[0];
  const poolIds = new Set(allVaults.map(pool => pool.id));
  const promos = vaultsAndPromos[1];

  // console.log(`Validating ${allVaults.length} vaults in ${chainId}...`);

  let updates: Updates = {};
  let exitCode = 0;

  //Governance pools should be separately verified
  const [govPools, nonGovVaults] = partition(allVaults, pool => pool.type === 'gov');
  const uniqueEarnedToken = new Set();
  const uniqueEarnedTokenAddress = new Set();
  const uniqueOracleId = new Set();
  const govPoolsByDepositAddress = new Map(govPools.map(pool => [pool.tokenAddress, pool]));
  let activePools = 0;

  // Populate some extra data.
  const viemClient = getViemClient(addressBookToAppId(chainId));
  const poolsWithGovData = await populateGovData(chainId, govPools, viemClient);
  const poolsWithVaultData = await populateVaultsData(chainId, nonGovVaults, viemClient);
  const poolsWithStrategyData = override(
    await populateStrategyData(chainId, poolsWithVaultData, viemClient)
  );
  const clmsWithData = await populateCowcentratedData(chainId, nonGovVaults, viemClient);

  poolsWithStrategyData.forEach(pool => {
    // Errors, should not proceed with build
    if (uniquePoolId.has(pool.id)) {
      console.error(`Error: ${pool.id} : Pool id duplicated: ${pool.id}`);
      exitCode = 1;
    }

    if (!isValidVaultId(pool.id)) {
      console.error(`Error: ${pool.id} : Pool id has invalid format: "${pool.id}"`);
      exitCode = 1;
    }

    if (uniqueEarnedToken.has(pool.earnedToken)) {
      console.error(`Error: ${pool.id} : Pool earnedToken duplicated: ${pool.earnedToken}`);
      exitCode = 1;
    }

    if (uniqueEarnedTokenAddress.has(pool.earnedTokenAddress)) {
      console.error(
        `Error: ${pool.id} : Pool earnedTokenAddress duplicated: ${pool.earnedTokenAddress}`
      );
      exitCode = 1;
    }

    if (pool.earnedTokenAddress !== pool.earnContractAddress) {
      console.error(
        `Error: ${pool.id} : Pool earnedTokenAddress not same as earnContractAddress: ${pool.earnedTokenAddress} != ${pool.earnContractAddress}`
      );
      exitCode = 1;
    }

    if (!pool.strategyTypeId) {
      console.error(`Error: ${pool.id} : strategyTypeId missing vault strategy type`);
      exitCode = 1;
    } else if (!validStrategyIds[pool.type].has(pool.strategyTypeId)) {
      console.error(
        `Error: ${pool.id} : strategyTypeId invalid, "StrategyDescription-${pool.type}-${pool.strategyTypeId}" not present in locales/en/risks.json`
      );
      exitCode = 1;
    }

    if (!pool.platformId) {
      console.error(`Error: ${pool.id} : platformId missing vault platform; see platforms.json`);
      exitCode = 1;
    } else if (!validPlatformIds.includes(pool.platformId)) {
      console.error(
        `Error: ${pool.id} : platformId ${pool.platformId} not present in platforms.json`
      );
      exitCode = 1;
    }

    if (!checkRisks(pool, pool.type === 'standard')) {
      exitCode = 1;
    }

    if (pool.oracle === 'lps') {
      if (!pool.tokenProviderId) {
        console.error(
          `Error: ${pool.id} : tokenProviderId missing LP provider platform; see platforms.json`
        );
        exitCode = 1;
      } else if (!validPlatformIds.includes(pool.tokenProviderId)) {
        console.error(
          `Error: ${pool.id} : tokenProviderId ${pool.tokenProviderId} not present in platforms.json`
        );
        exitCode = 1;
      }
    }

    if (!pool.createdAt) {
      console.error(
        `Error: ${pool.id} : Pool createdAt timestamp missing - required for UI: vault sorting`
      );
      exitCode = 1;
    } else if (isNaN(pool.createdAt)) {
      console.error(`Error: ${pool.id} : Pool createdAt timestamp wrong type, should be a number`);
      exitCode = 1;
    }

    if (pool.status === 'eol') {
      if (!pool.retiredAt) {
        console.error(`Error: ${pool.id} : Pool retiredAt timestamp missing`);
        exitCode = 1;
      } else if (
        typeof pool.retiredAt !== 'number' ||
        isNaN(pool.retiredAt) ||
        !isFinite(pool.retiredAt)
      ) {
        console.error(
          `Error: ${pool.id} : Pool retiredAt timestamp wrong type, should be a number`
        );
        exitCode = 1;
      }
    }

    if (pool.status === 'paused') {
      if (!pool.pausedAt) {
        console.error(`Error: ${pool.id} : Pool pausedAt timestamp missing`);
        exitCode = 1;
      } else if (
        typeof pool.pausedAt !== 'number' ||
        isNaN(pool.pausedAt) ||
        !isFinite(pool.pausedAt)
      ) {
        console.error(`Error: ${pool.id} : Pool pausedAt timestamp wrong type, should be a number`);
        exitCode = 1;
      }
    }

    if (!pool.network) {
      console.error(`Error: ${pool.id} : Missing network`);
      exitCode = 1;
    } else if (pool.network !== addressBookToAppId(chainId)) {
      console.error(
        `Error: ${pool.id} : Network mismatch ${pool.network} != ${addressBookToAppId(chainId)}`
      );
      exitCode = 1;
    }

    // Assets
    if (!pool.assets || !Array.isArray(pool.assets) || !pool.assets.length) {
      console.error(`Error: ${pool.id} : Missing assets array`);
      exitCode = 1;
    } else if (pool.status !== 'eol') {
      for (const assetId of pool.assets) {
        if (!(assetId in addressBook[chainId].tokens)) {
          if (excludedAbPools.includes(pool.id)) continue;
          // just warn for now
          console.warn(`Warning: ${pool.id} : Asset ${assetId} not in addressbook on ${chainId}`);
          // exitCode = 1;
        }
      }
    }

    // Cowcentrated should have RP
    if (pool.type === 'cowcentrated' && pool.status !== 'eol') {
      const govPool = govPoolsByDepositAddress.get(pool.earnContractAddress);
      if (!govPool) {
        console.error(`Error: ${pool.id} : CLM missing CLM pool`);
        exitCode = 1;
      }
    }

    // Old fields we no longer need
    const fieldsToDelete = Object.keys(oldFields).filter(field => field in pool);
    if (fieldsToDelete.length) {
      console.error(
        `Error: ${pool.id} : These fields are no longer needed: ${fieldsToDelete.join(', ')}`
      );
      fieldsToDelete.forEach(field => console.log(`\t${field}: '${oldFields[field]}',`));
      exitCode = 1;
    }

    addressFields.forEach(field => {
      if (field in pool && !isValidChecksumAddress(pool[field])) {
        const maybeValid = maybeChecksumAddress(pool[field]);
        console.error(
          `Error: ${pool.id} : ${field} requires checksum - ${
            maybeValid ? `\n\t${field}: '${maybeValid}',` : 'it is invalid'
          }`
        );
        exitCode = 1;
      }
    });

    if (pool.status === 'active') {
      activePools++;
    }

    if (new BigNumber(pool.totalSupply || '0').isZero()) {
      if (pool.status !== 'eol') {
        console.error(`Error: ${pool.id} : Pool is empty`);
        exitCode = 1;
        if (!('emptyVault' in updates)) updates['emptyVault'] = {};
        updates.emptyVault[pool.id] = pool.earnContractAddress;
      } else {
        console.warn(`${pool.id} : eol pool is empty`);
      }
    }
    if (checkPointsStructureIds(pool) > 0) {
      exitCode = 1;
    }

    uniquePoolId.add(pool.id);
    uniqueEarnedToken.add(pool.earnedToken);
    uniqueEarnedTokenAddress.add(pool.earnedTokenAddress);
    uniqueOracleId.add(pool.oracleId);

    const { keeper, strategyOwner, vaultOwner, beefyFeeRecipient, beefyFeeConfig } =
      addressBook[chainId].platforms.beefyfinance;

    updates = isKeeperCorrect(pool, chainId, keeper, updates);
    updates = isStratOwnerCorrect(pool, chainId, strategyOwner, updates);
    updates = isVaultOwnerCorrect(pool, chainId, vaultOwner, updates);
    updates = isBeefyFeeRecipientCorrect(pool, chainId, beefyFeeRecipient, updates);
    updates = isBeefyFeeConfigCorrect(pool, chainId, beefyFeeConfig, updates);
    updates = isHarvestOnDepositCorrect(pool, chainId, updates);
  });

  // Boosts
  // console.log(`Validating ${promos.length} promos in ${chainId}...`);
  const seenPromoIds = new Set();
  promos.forEach(promo => {
    if (seenPromoIds.has(promo.id)) {
      console.error(`Error: Promo ${promo.id}: Promo id duplicated: ${promo.id}`);
      exitCode = 1;
      return;
    }
    seenPromoIds.add(promo.id);

    if (!isValidVaultId(promo.id)) {
      console.error(`Error: Promo ${promo.id}: Promo id has invalid format: "${promo.id}"`);
      exitCode = 1;
      return;
    }

    if (!poolIds.has(promo.vaultId)) {
      console.error(`Error: Promo ${promo.id}: Promo has non-existent vault id ${promo.vaultId}.`);
      exitCode = 1;
      return;
    }

    if ((promo.partners || []).length === 0 && !promo.campaign) {
      console.error(`Error: Promo ${promo.id}: Promo has no partners or campaign.`);
      exitCode = 1;
      return;
    }

    if (promo.partners && promo.partners.length) {
      const invalidPartners = promo.partners.filter(partner => !(partner in partners));
      if (invalidPartners.length) {
        console.error(`Error: Promo ${promo.id}: Missing partners: ${invalidPartners.join(', ')}`);
        exitCode = 1;
        return;
      }
    }

    if (promo.campaign && !(promo.campaign in campaigns)) {
      console.error(`Error: Promo ${promo.id}: Missing campaign: ${promo.campaign}`);
      exitCode = 1;
      return;
    }

    for (const reward of promo.rewards) {
      if (reward.type !== 'token' || !reward.address) continue;

      if (!isValidChecksumAddress(reward.address)) {
        console.error(
          `Error: Promo ${promo.id}: Earned token ${reward.address} address is not checksummed: ${maybeChecksumAddress(reward.address)}`
        );
        exitCode = 1;
        return;
      }

      const earnedVault = nonGovVaults.find(pool => pool.earnContractAddress === reward.address);
      if (earnedVault) {
        if (reward.decimals !== 18) {
          console.error(
            `Error: Promo ${promo.id}: Earned token decimals mismatch ${reward.decimals} != 18`
          );
          exitCode = 1;
          return;
        }
        // TODO oracle etc
      } else {
        const abToken = addressBook[chainId].tokenAddressMap[reward.address];
        if (!abToken) {
          // TODO need to tidy up old boosts before we can make this error
          // console.warn(
          //   `Warn: Promo ${promo.id}: Earned token ${reward.symbol} not in addressbook at ${reward.address}`
          // );
          // exitCode = 1;
          //return;
          continue;
        }

        if (abToken.decimals !== reward.decimals) {
          console.error(
            `Error: Promo ${promo.id}: Earned token decimals mismatch ${reward.decimals} != ${abToken.decimals}`
          );
          exitCode = 1;
          return;
        }

        if (abToken.oracleId !== reward.oracleId) {
          console.error(
            `Error: Promo ${promo.id}: Earned token oracle id mismatch ${reward.oracleId} != ${abToken.oracleId}`
          );
          exitCode = 1;
          return;
        }
      }
    }
  });

  // Gov Pools
  poolsWithGovData.forEach(pool => {
    if (uniquePoolId.has(pool.id)) {
      console.error(`Error: ${pool.id} : Pool id duplicated: ${pool.id}`);
      exitCode = 1;
    }

    if (!isValidVaultId(pool.id)) {
      console.error(`Error: ${pool.id} : Pool id has invalid format: "${pool.id}"`);
      exitCode = 1;
    }

    if (!pool.strategyTypeId) {
      console.error(`Error: ${pool.id} : strategyTypeId missing gov strategy type`);
      exitCode = 1;
    } else if (!validStrategyIds.gov.has(pool.strategyTypeId)) {
      console.error(
        `Error: ${pool.id} : strategyTypeId invalid, "StrategyDescription-${pool.type}-${pool.strategyTypeId}" not present in locales/en/risks.json`
      );
      exitCode = 1;
    }

    if (checkPointsStructureIds(pool) > 0) {
      exitCode = 1;
    }

    const { devMultisig } = addressBook[chainId].platforms.beefyfinance;
    updates = isRewardPoolOwnerCorrect(pool, chainId, devMultisig, updates);
  });

  // CLMs
  clmsWithData.forEach(clm => {
    if (!clm.oracleForToken0) {
      console.error(
        `Error: ${clm.id} : Beefy oracle has no subOracle entry for token0 ${clm.token0}`
      );
      exitCode = 1;
    }
    if (!clm.oracleForToken1) {
      console.error(
        `Error: ${clm.id} : Beefy oracle has no subOracle entry for token1 ${clm.token1}`
      );
      exitCode = 1;
    }

    if (checkPointsStructureIds(clm) > 0) {
      exitCode = 1;
    }
  });

  if (!isEmpty(updates)) {
    exitCode = 1;
  }

  // console.log(`${chainId} active pools: ${activePools}/${nonGovVaults.length}\n`);
  if (activePools === 0) console.log(`${chainId} 0 active pools, consider exclude\n`);

  return { chainId, exitCode, updates };
};

// Validation helpers. These only log for now, could throw error if desired.
const isKeeperCorrect = (
  pool: VaultConfigWithStrategyData,
  chain: AddressBookChainId,
  chainKeeper: string,
  updates: Updates
) => {
  if (pool.status !== 'eol' && pool.keeper !== undefined && pool.keeper !== chainKeeper) {
    console.log(`Pool ${pool.id} should update keeper. From: ${pool.keeper} To: ${chainKeeper}`);

    if (!('keeper' in updates)) updates['keeper'] = {};
    if (!(chain in updates.keeper)) updates.keeper[chain] = {};

    if (pool.keeper in updates.keeper[chain]) {
      updates.keeper[chain][pool.keeper].push(pool.strategy);
    } else {
      updates.keeper[chain][pool.keeper] = [pool.strategy];
    }
  }

  return updates;
};

const isStratOwnerCorrect = (
  pool: VaultConfigWithStrategyData,
  chain: AddressBookChainId,
  owner: string,
  updates: Updates
) => {
  const validOwners = [...oldValidOwners, owner];
  if (pool.stratOwner !== undefined && !validOwners.includes(pool.stratOwner)) {
    console.log(`Pool ${pool.id} should update strat owner. From: ${pool.stratOwner} To: ${owner}`);

    if (!('stratOwner' in updates)) updates['stratOwner'] = {};
    if (!(chain in updates.stratOwner)) updates.stratOwner[chain] = {};

    if (pool.stratOwner in updates.stratOwner[chain]) {
      updates.stratOwner[chain][pool.stratOwner].push(pool.strategy);
    } else {
      updates.stratOwner[chain][pool.stratOwner] = [pool.strategy];
    }
  }

  return updates;
};

const isVaultOwnerCorrect = (
  pool: VaultConfigWithStrategyData,
  chain: AddressBookChainId,
  owner: string,
  updates: Updates
) => {
  const validOwners = [...oldValidOwners, owner];
  if (pool.vaultOwner !== undefined && !validOwners.includes(pool.vaultOwner)) {
    console.log(`Pool ${pool.id} should update vault owner. From: ${pool.vaultOwner} To: ${owner}`);

    if (!('vaultOwner' in updates)) updates['vaultOwner'] = {};
    if (!(chain in updates.vaultOwner)) updates.vaultOwner[chain] = {};

    if (pool.vaultOwner in updates.vaultOwner[chain]) {
      updates.vaultOwner[chain][pool.vaultOwner].push(pool.earnContractAddress);
    } else {
      updates.vaultOwner[chain][pool.vaultOwner] = [pool.earnContractAddress];
    }
  }

  return updates;
};

const isRewardPoolOwnerCorrect = (
  pool: VaultConfigWithGovData,
  chain: AddressBookChainId,
  owner: string,
  updates: Updates
) => {
  const validOwners: string[] = oldValidRewardPoolOwners[chain] || [];
  if (
    pool.rewardPoolOwner !== undefined &&
    pool.rewardPoolOwner !== owner &&
    !validOwners.includes(pool.rewardPoolOwner)
  ) {
    console.log(
      `Reward Pool ${pool.id} should update owner. From: ${pool.rewardPoolOwner} To: ${owner}`
    );

    if (!('rewardPoolOwner' in updates)) updates['rewardPoolOwner'] = {};
    if (!(chain in updates.rewardPoolOwner)) updates.rewardPoolOwner[chain] = {};

    if (pool.rewardPoolOwner in updates.rewardPoolOwner[chain]) {
      updates.rewardPoolOwner[chain][pool.rewardPoolOwner].push(pool.earnContractAddress);
    } else {
      updates.rewardPoolOwner[chain][pool.rewardPoolOwner] = [pool.earnContractAddress];
    }
  }

  return updates;
};

const isBeefyFeeRecipientCorrect = (
  pool: VaultConfigWithStrategyData,
  chain: AddressBookChainId,
  recipient: string,
  updates: Updates
) => {
  const validRecipients = oldValidFeeRecipients[chain] || [];
  if (
    pool.status === 'active' &&
    pool.beefyFeeRecipient !== undefined &&
    pool.beefyFeeRecipient !== recipient &&
    !validRecipients.includes(pool.beefyFeeRecipient)
  ) {
    console.log(
      `Pool ${pool.id} should update beefy fee recipient. From: ${pool.beefyFeeRecipient} To: ${recipient}`
    );

    if (!('beefyFeeRecipient' in updates)) updates['beefyFeeRecipient'] = {};
    if (!(chain in updates.beefyFeeRecipient)) updates.beefyFeeRecipient[chain] = {};

    if (pool.stratOwner && pool.stratOwner in updates.beefyFeeRecipient[chain]) {
      updates.beefyFeeRecipient[chain][pool.stratOwner].push(pool.strategy);
    } else {
      updates.beefyFeeRecipient[chain]['undefined'] = [pool.strategy];
    }
  }

  return updates;
};

const isBeefyFeeConfigCorrect = (
  pool: VaultConfigWithStrategyData,
  chain: AddressBookChainId,
  feeConfig: string | undefined,
  updates: Updates
) => {
  if (
    pool.status === 'active' &&
    pool.beefyFeeConfig !== undefined &&
    pool.beefyFeeConfig !== feeConfig
  ) {
    console.log(
      `Pool ${pool.id} should update beefy fee config. From: ${pool.beefyFeeConfig} To: ${feeConfig}`
    );

    if (!('beefyFeeConfig' in updates)) updates['beefyFeeConfig'] = {};
    if (!(chain in updates.beefyFeeConfig)) updates.beefyFeeConfig[chain] = {};

    if (pool.stratOwner && pool.stratOwner in updates.beefyFeeConfig[chain]) {
      updates.beefyFeeConfig[chain][pool.stratOwner].push(pool.strategy);
    } else {
      updates.beefyFeeConfig[chain]['undefined'] = [pool.strategy];
    }
  }

  return updates;
};

const isHarvestOnDepositCorrect = (
  pool: VaultConfigWithStrategyData,
  chain: AddressBookChainId,
  updates: Updates
) => {
  if (
    pool.status === 'active' &&
    pool.harvestOnDeposit !== undefined &&
    !nonHarvestOnDepositChains.includes(chain) &&
    !nonHarvestOnDepositPools.includes(pool.id) &&
    pool.harvestOnDeposit !== true
  ) {
    console.log(
      `Pool ${pool.id} should update to harvest on deposit. From: ${pool.harvestOnDeposit} To: true`
    );

    if (!('harvestOnDeposit' in updates)) updates['harvestOnDeposit'] = {};
    if (!(chain in updates.harvestOnDeposit)) updates.harvestOnDeposit[chain] = {};

    if (pool.harvestOnDeposit && pool.harvestOnDeposit in updates.harvestOnDeposit[chain]) {
      updates.harvestOnDeposit[chain][pool.harvestOnDeposit].push(pool.harvestOnDeposit);
    } else {
      updates.harvestOnDeposit[chain]['undefined'] = [pool.harvestOnDeposit];
    }
  }

  return updates;
};

const checkRisks = (pool: VaultConfig, allowMissingEol: boolean = false) => {
  if (!pool.risks || pool.risks.length === 0) {
    if (!(allowMissingEol && pool.status === 'eol')) {
      console.error(`Error: ${pool.id} : risks missing`);
      return false;
    }
  } else if (pool.risks.some(risk => !validRisks.has(risk))) {
    const invalidRisks = pool.risks.filter(risk => !validRisks.has(risk));
    console.error(`Error: ${pool.id} : risks invalid - ${invalidRisks.join(', ')}`);
    return false;
  }

  return true;
};

const checkPointsStructureIds = (pool: VaultConfig) => {
  let exitCode = 0;

  if (pool.pointStructureIds && pool.pointStructureIds.length > 0) {
    const invalidPointStructureIds = pool.pointStructureIds.filter(
      p => !validPointProviderIds.includes(p)
    );
    if (invalidPointStructureIds.length > 0) {
      console.error(
        `Error: ${pool.id} : pointStructureIds ${invalidPointStructureIds} not present in points.json`
      );
      exitCode = 1;
    }
  }

  // check for the provider eligibility
  for (const pointProvider of pointProviders) {
    const hasProvider = pool.pointStructureIds?.includes(pointProvider.id) ?? false;

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
          (pool.tokenProviderId === eligibility.tokenProviderId &&
            pool.assets?.some(a => eligibility.tokens?.includes(a))) ??
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
          (eligibility.platformId === pool.platformId &&
            pool.assets?.some(a => eligibility.tokens?.includes(a))) ??
            false
        );
      } else if (eligibility.type === 'platform') {
        if (!('platformId' in eligibility)) {
          throw new Error(`Error: ${pointProvider.id} : eligibility.platformId missing`);
        }
        if (!('liveAfter' in eligibility)) {
          throw new Error(`Error: ${pointProvider.id} : eligibility.liveAfter missing`);
        }

        shouldHaveProviderArr.push(
          eligibility.platformId === pool.platformId &&
            (pool.retiredAt === undefined ||
              new Date(eligibility.liveAfter) < new Date(pool.retiredAt * 1000))
        );
      } else if (eligibility.type === 'provider') {
        if (!('tokenProviderId' in eligibility)) {
          throw new Error(`Error: ${pointProvider.id} : eligibility.tokenProviderId missing`);
        }

        shouldHaveProviderArr.push(pool.tokenProviderId === eligibility.tokenProviderId);
      } else if (eligibility.type === 'token-holding') {
        if (!('tokens' in eligibility)) {
          throw new Error(`Error: ${pointProvider.id} : eligibility.tokens missing`);
        }

        shouldHaveProviderArr.push(
          pool.assets?.some(a => eligibility?.tokens?.includes(a)) ?? false
        );
      } else if (eligibility.type === 'on-chain-lp') {
        if (!('chain' in eligibility)) {
          throw new Error(`Error: ${pointProvider.id} : eligibility.chain missing`);
        }

        shouldHaveProviderArr.push(pool.network === eligibility.chain);
      } else if (eligibility.type === 'earned-token-name-regex') {
        if (!('regex' in eligibility)) {
          throw new Error(`Error: ${pointProvider.id} : eligibility.regex missing`);
        }
        const earnedToken = pool.earnedToken;
        const regex = new RegExp(eligibility.regex as string);
        shouldHaveProviderArr.push(regex.test(earnedToken));
      } else if (eligibility.type === 'vault-whitelist') {
        shouldHaveProviderArr.push(hasProvider);
      } else if (eligibility.type === 'underlying-whitelist') {
        if (!('tokens' in eligibility)) {
          throw new Error(`Error: ${pointProvider.id} : eligibility.tokens missing`);
        }
        if (!('chain' in eligibility)) {
          throw new Error(`Error: ${pointProvider.id} : eligibility.chain missing`);
        }

        if (eligibility.chain !== pool.network) {
          shouldHaveProviderArr.push(false);
        } else {
          shouldHaveProviderArr.push(
            pool.assets?.every(a => eligibility.tokens?.includes(a)) ?? false
          );
        }
      } else {
        throw new Error(
          `Error: ${pointProvider.id} : eligibility.type ${eligibility.type} not implemented, please implement.`
        );
      }
    }

    // bool or
    const shouldHaveProvider = shouldHaveProviderArr.some(Boolean);

    if (shouldHaveProvider && !hasProvider) {
      console.error(
        `Error: ${pool.id} : pointStructureId ${pointProvider.id} should be present in pointStructureIds`
      );
      exitCode = 1;
    } else if (!shouldHaveProvider && hasProvider) {
      console.error(
        `Error: ${pool.id} : pointStructureId ${pointProvider.id} should NOT be present in pointStructureIds`
      );
      exitCode = 1;
    }
  }

  return exitCode;
};

// Helpers to populate required addresses.

type VaultConfigWithGovData = Omit<VaultConfig, 'type'> & {
  type: NonNullable<VaultConfig['type']>;
  rewardPoolOwner: string | undefined;
};
const populateGovData = async (
  chain: AddressBookChainId,
  pools: VaultConfig[],
  viemClient: PublicClient,
  retries = 5
): Promise<VaultConfigWithGovData[]> => {
  try {
    try {
      const results = await Promise.all(
        pools.map(pool => {
          const vaultContract = getContract({
            client: viemClient,
            abi: StandardVaultAbi,
            address: pool.earnContractAddress as Address,
          });
          return vaultContract.read.owner();
        })
      );
      return pools.map((pool, i) => {
        return {
          ...pool,
          type: pool.type || 'gov',
          rewardPoolOwner: results[i],
        };
      });
    } catch (e) {
      if (retries > 0) {
        console.warn(`retrying populateGovData on ${chain} ${e instanceof Error ? e.message : e}`);
        await sleep(1_000);
        return populateGovData(chain, pools, viemClient, retries - 1);
      }
      throw e;
    }
  } catch (e) {
    throw new Error(`Failed to populate gov data for ${chain}`, { cause: e });
  }
};

type ClmVaultConfig = Omit<VaultConfig, 'type'> & { type: 'cowcentrated' };
type VaultConfigWithCowcentratedData = ClmVaultConfig & {
  token0: string;
  token1: string;
  oracleForToken0: boolean;
  oracleForToken1: boolean;
};

const populateCowcentratedData = async (
  chain: keyof typeof addressBook,
  pools: VaultConfig[],
  viemClient: PublicClient,
  retries = 5
): Promise<VaultConfigWithCowcentratedData[]> => {
  try {
    const clms = pools.filter((p): p is ClmVaultConfig => p.type === 'cowcentrated');
    if (clms.length === 0) {
      return [];
    }

    const { multicall: multicallAddress, beefyOracle: beefyOracleAddress } =
      addressBook[chain].platforms.beefyfinance;
    if (!multicallAddress || !beefyOracleAddress) {
      throw new Error('Missing multicall or beefyOracle address');
    }
    const beefyOracleSingle = getContract({
      client: viemClient,
      abi: [
        {
          inputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          name: 'subOracle',
          outputs: [
            {
              internalType: 'address',
              name: 'oracle',
              type: 'address',
            },
            {
              internalType: 'bytes',
              name: 'data',
              type: 'bytes',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
      ] as const satisfies Abi,
      address: beefyOracleAddress as Address,
    });

    const beefyOracleDouble = getContract({
      client: viemClient,
      abi: [
        {
          inputs: [
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
            {
              internalType: 'address',
              name: '',
              type: 'address',
            },
          ],
          name: 'subOracle',
          outputs: [
            {
              internalType: 'address',
              name: 'oracle',
              type: 'address',
            },
            {
              internalType: 'bytes',
              name: 'data',
              type: 'bytes',
            },
          ],
          stateMutability: 'view',
          type: 'function',
        },
      ] as const satisfies Abi,
      address: beefyOracleAddress as Address,
    });

    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

    try {
      const tokenResults = (
        await Promise.all(
          clms.map(async clm => {
            const vaultContract = getContract({
              address: clm.earnContractAddress as Address,
              client: viemClient,
              abi: [
                {
                  inputs: [],
                  name: 'wants',
                  outputs: [
                    {
                      internalType: 'address',
                      name: 'token0',
                      type: 'address',
                    },
                    {
                      internalType: 'address',
                      name: 'token1',
                      type: 'address',
                    },
                  ],
                  stateMutability: 'view',
                  type: 'function',
                },
              ] as const satisfies Abi,
            });
            return vaultContract.read.wants();
          })
        )
      ).map(wantsResult => ({
        token0: wantsResult[0],
        token1: wantsResult[1],
      }));

      const oracleResults = await Promise.all(
        tokenResults.map(async result => {
          return await Promise.all([
            beefyOracleSingle.read
              .subOracle([result.token0])
              .catch(e => catchRevertErrorIntoUndefined(e)),
            beefyOracleSingle.read
              .subOracle([result.token1])
              .catch(e => catchRevertErrorIntoUndefined(e)),
            beefyOracleDouble.read
              .subOracle([ZERO_ADDRESS, result.token0])
              .catch(e => catchRevertErrorIntoUndefined(e)),
            beefyOracleDouble.read
              .subOracle([ZERO_ADDRESS, result.token1])
              .catch(e => catchRevertErrorIntoUndefined(e)),
          ]);
        })
      );

      const oracles = oracleResults
        .map(result => ({
          token0: result[0],
          token1: result[1],
          token0For0xZero: result[2],
          token1For0xZero: result[3],
        }))
        .map(result => ({
          oracleForToken0: !!(
            (result.token0 && result.token0[0] && result.token0[0] !== ZERO_ADDRESS) ||
            (result.token0For0xZero &&
              result.token0For0xZero[0] &&
              result.token0For0xZero[0] !== ZERO_ADDRESS)
          ),
          oracleForToken1: !!(
            (result.token1 && result.token1[0] && result.token1[0] !== ZERO_ADDRESS) ||
            (result.token1For0xZero &&
              result.token1For0xZero[0] &&
              result.token1For0xZero[0] !== ZERO_ADDRESS)
          ),
        }));

      return clms.map((clm, i) => ({
        ...clm,
        token0: tokenResults[i].token0,
        token1: tokenResults[i].token1,
        oracleForToken0: oracles[i].oracleForToken0,
        oracleForToken1: oracles[i].oracleForToken1,
      }));
    } catch (e) {
      if (retries > 0) {
        console.warn(`retrying populateCowcentratedData ${e instanceof Error ? e.message : e}`);
        await sleep(1_000);
        return populateCowcentratedData(chain, pools, viemClient, retries - 1);
      }
      throw e;
    }
  } catch (e) {
    throw new Error(`Failed to populate cowcentrated data for ${chain}`, { cause: e });
  }
};

type VaultConfigWithVaultData = Omit<VaultConfig, 'type'> & {
  type: NonNullable<VaultConfig['type']>;
  strategy: Address | undefined;
  vaultOwner: Address | undefined;
  totalSupply: string | undefined;
};
const populateVaultsData = async (
  chain: AddressBookChainId,
  pools: VaultConfig[],
  viemClient: PublicClient,
  retries = 5
): Promise<VaultConfigWithVaultData[]> => {
  try {
    try {
      const results = await Promise.all(
        pools.map(async pool => {
          const vaultContract = getContract({
            client: viemClient,
            abi: StandardVaultAbi,
            address: pool.earnContractAddress as Address,
          });
          return await Promise.all([
            pool.type === 'erc4626' ?
              Promise.resolve(pool.earnContractAddress as Address)
            : await vaultContract.read.strategy(),
            vaultContract.read.owner().catch(e => catchRevertErrorIntoUndefined(e)),
            vaultContract.read.totalSupply(),
          ]);
        })
      );

      return pools.map((pool, i) => {
        return {
          ...pool,
          type: pool.type || 'standard',
          strategy: results[i][0],
          vaultOwner: results[i][1],
          totalSupply: results[i][2].toString(10),
        };
      });
    } catch (e) {
      if (retries > 0) {
        console.warn(`retrying populateVaultsData ${e instanceof Error ? e.message : e}`);
        await sleep(1_000);
        return populateVaultsData(chain, pools, viemClient, retries - 1);
      }
      throw e;
    }
  } catch (e) {
    throw new Error(`Failed to populate vault data for ${chain}`, { cause: e });
  }
};

type VaultConfigWithStrategyData = VaultConfigWithVaultData & {
  keeper: Address | undefined;
  beefyFeeRecipient: Address | undefined;
  beefyFeeConfig: Address | undefined;
  stratOwner: Address | undefined;
  harvestOnDeposit: boolean | undefined;
};
const populateStrategyData = async (
  chain: AddressBookChainId,
  pools: VaultConfigWithVaultData[],
  viemClient: PublicClient,
  retries = 5
): Promise<VaultConfigWithStrategyData[]> => {
  try {
    const results = await Promise.all(
      pools.map(async pool => {
        const stratContract = getContract({
          client: viemClient,
          abi: StratAbi,
          address: pool.strategy as Address,
        });
        return Promise.all([
          stratContract.read.keeper().catch(e => catchRevertErrorIntoUndefined(e)),
          stratContract.read.beefyFeeRecipient().catch(e => catchRevertErrorIntoUndefined(e)),
          stratContract.read.beefyFeeConfig().catch(e => catchRevertErrorIntoUndefined(e)),
          stratContract.read.owner().catch(e => catchRevertErrorIntoUndefined(e)),
          stratContract.read.harvestOnDeposit().catch(e => catchRevertErrorIntoUndefined(e)),
        ]);
      })
    );

    const mappedResults = results.map(res => ({
      keeper: res[0],
      beefyFeeRecipient: res[1],
      beefyFeeConfig: res[2],
      stratOwner: res[3],
      harvestOnDeposit: res[4],
    }));

    return pools.map((pool, i) => {
      return {
        ...pool,
        ...mappedResults[i],
      };
    });
  } catch (e) {
    if (retries > 0) {
      console.warn(`retrying populateStrategyData ${e instanceof Error ? e.message : e}`);
      await sleep(1_000);
      return populateStrategyData(chain, pools, viemClient, retries - 1);
    }
    throw e;
  }
};

async function validatePlatformTypes(): Promise<number> {
  let exitCode = 0;
  // hack to make sure all the platform types in PlatformType are present in the set
  const validTypes = new Set<string>(
    Object.keys({
      amm: true,
      alm: true,
      bridge: true,
      'money-market': true,
      perps: true,
      'yield-boost': true,
      farm: true,
    } satisfies Record<PlatformType, unknown>)
  );

  // Check if valid types have i18n keys
  for (const type of validTypes.keys()) {
    const requiredKeys = [
      `Details-Platform-Type-Description-${type}`,
      `Details-Platform-Type-${type}`,
    ];
    for (const key of requiredKeys) {
      if (!(i18keys as Record<string, string>)[key]) {
        console.error(`Missing i18n key "${key}" for platform type "${type}"`);
        exitCode = 1;
      }
    }
  }

  const platformsWithType = platforms.filter(
    (
      platform
    ): platform is Extract<
      (typeof platforms)[number],
      {
        type: string;
      }
    > => !!platform.type
  );
  await Promise.all(
    platformsWithType.map(async platform => {
      // Check type is valid
      if (!validTypes.has(platform.type)) {
        console.error(`Platform ${platform.id}: Invalid type "${platform.type}"`);
        exitCode = 1;
      }

      // Platform image must exist if platform has a type
      const possiblePaths = [
        `./src/images/platforms/${platform.id}.svg`,
        `./src/images/platforms/${platform.id}.webp`,
        `./src/images/platforms/${platform.id}.png`,
      ];
      let found = false;
      for (const path of possiblePaths) {
        if (await fileExists(path)) {
          found = true;
          break;
        }
      }
      if (!found) {
        console.error(`Platform ${platform.id}: Missing image: "${possiblePaths[0]}"`);
        exitCode = 1;
      }
    })
  );

  return exitCode;
}

function catchRevertErrorIntoUndefined(e: unknown) {
  if (
    e &&
    (e instanceof ContractFunctionRevertedError || e instanceof ContractFunctionExecutionError)
  ) {
    return undefined;
  }
  throw e;
}

const override = (pools: VaultConfigWithStrategyData[]): VaultConfigWithStrategyData[] => {
  Object.keys(overrides).forEach(id => {
    pools
      .filter(p => p.id.includes(id))
      .forEach(pool => {
        const override = overrides[id];
        keys(override).forEach(key => {
          pool[key] = override[key];
        });
      });
  });
  return pools;
};

/** @dev do not add to this list */
const allowOldInvalidIds = new Set([
  'quick-hbar[0x]-mimatic-eol',
  'moo_curve-poly-atricrypto3-metavault trade',
  'cakev2-arpa-bnb=eol',
  'cakev2-perl-bnb=eol',
]);

/** vault ids should not require %-encoded urls */
function isValidVaultId(vaultId: string) {
  // same as encodeURIComponent (but allows + which strictly speaking doesn't need % encoding)
  return (
    allowOldInvalidIds.has(vaultId) ||
    vaultId.trim().match(/^([a-z]|[A-Z]|[0-9]|[_.!~*'()+-])+$/) !== null
  );
}

validatePools()
  .then(exitCode => process.exit(exitCode))
  .catch(err => {
    console.error(err);
    process.exit(-1);
  });
