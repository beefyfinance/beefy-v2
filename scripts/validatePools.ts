import { MultiCall } from 'eth-multicall';
import { addressBook } from 'blockchain-addressbook';
import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { isEmpty, isValidChecksumAddress, maybeChecksumAddress } from './common/utils';
import { getVaultsIntegrity } from './common/exclude';
import {
  addressBookToAppId,
  chainIds,
  chainRpcs,
  excludeChains,
  excludedChainIds,
  getBoostsForChain,
  getVaultsForChain,
} from './common/config';
import { getStrategyIds } from './common/strategies';
import strategyABI from '../src/config/abi/strategy.json';
import { StandardVaultAbi } from '../src/config/abi/StandardVaultAbi';
import platforms from '../src/config/platforms.json';
import type { VaultConfig } from '../src/features/data/apis/config-types';
import partition from 'lodash/partition';
import { AbiItem } from 'web3-utils';

const overrides = {
  'bunny-bunny-eol': { keeper: undefined, stratOwner: undefined },
  'bifi-maxi': { stratOwner: undefined }, // harvester 0xDe30
  'beltv2-4belt': { vaultOwner: undefined }, // moonpot deployer
  'baseswap-axlwbtc-usdbc': { harvestOnDeposit: undefined },
  'kinetix-klp': { harvestOnDeposit: undefined },
  'bifi-vault': { beefyFeeRecipient: undefined }, // TODO: remove
  'convex-eusdfraxbp': { beefyFeeRecipient: undefined }, // TODO: remove
};

const oldValidOwners = [
  addressBook.fantom.platforms.beefyfinance.devMultisig,
  addressBook.polygon.platforms.beefyfinance.devMultisig,
  addressBook.arbitrum.platforms.beefyfinance.devMultisig,
];

const oldValidFeeRecipients = {
  canto: '0xF09d213EE8a8B159C884b276b86E08E26B3bfF75',
  kava: '0x07F29FE11FbC17876D9376E3CD6F2112e81feA6F',
  moonriver: '0x617f12E04097F16e73934e84f35175a1B8196551',
  moonbeam: '0x3E7F60B442CEAE0FE5e48e07EB85Cfb1Ed60e81A',
};

const nonHarvestOnDepositChains = ['ethereum', 'avax'];
const nonHarvestOnDepositPools = ['venus-bnb', 'equilibria-arb-silo-usdc.e'];

const addressFields = ['tokenAddress', 'earnedTokenAddress', 'earnContractAddress'];

const validPlatformIds = platforms.map(platform => platform.id);
const { gov: validGovStrategyIds, vault: validVaultStrategyIds } = getStrategyIds();

const oldFields = {
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

const validatePools = async () => {
  let exitCode = 0;
  let updates = {};
  const uniquePoolId = new Set();

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

      console.log(`Excluded chain ${chainId} integrity check passed`);
    });

    if (exitCode != 0) {
      console.error('*** Excluded chain integrity check failed ***');
      console.error('If you removed a vault, update excludeChains in scripts/common/config.ts');
      return exitCode;
    }
  }

  let promises = chainIds.map(chainId => validateSingleChain(chainId, uniquePoolId));
  let results = await Promise.all(promises);

  exitCode = results.reduce((acum, cur) => (acum + cur.exitCode > 0 ? 1 : 0), 0);
  results.forEach(res => {
    if (!isEmpty(res.updates)) {
      updates[res.chainId] = res.updates;
    }
  });
  // Helpful data structures to correct addresses.
  console.log('Required updates.', JSON.stringify(updates));

  if (excludedChainIds.length > 0) {
    console.warn(`*** Excluded chains: ${excludedChainIds.join(', ')} ***`);
  }

  return exitCode;
};

const validateSingleChain = async (chainId, uniquePoolId) => {
  let [pools, boosts] = await Promise.all([getVaultsForChain(chainId), getBoostsForChain(chainId)]);

  console.log(`Validating ${pools.length} pools in ${chainId}...`);

  let updates: Record<string, Record<string, any>> = {};
  let exitCode = 0;
  //Governance pools should be separately verified
  const [govPools, vaultPools] = partition(pools, pool => pool.type === 'gov');
  pools = vaultPools;

  const poolIds = new Set(pools.map(pool => pool.id));
  const uniqueEarnedToken = new Set();
  const uniqueEarnedTokenAddress = new Set();
  const uniqueOracleId = new Set();
  let activePools = 0;

  // Populate some extra data.
  const web3 = new Web3(chainRpcs[chainId]);
  const poolsWithVaultData = await populateVaultsData(chainId, pools, web3);
  const poolsWithStrategyData = override(
    await populateStrategyData(chainId, poolsWithVaultData, web3)
  );

  poolsWithStrategyData.forEach(pool => {
    // Errors, should not proceed with build
    if (uniquePoolId.has(pool.id)) {
      console.error(`Error: ${pool.id} : Pool id duplicated: ${pool.id}`);
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
    } else if (!validVaultStrategyIds.includes(pool.strategyTypeId)) {
      console.error(
        `Error: ${pool.id} : strategyTypeId invalid, "StrategyDescription-${pool.strategyTypeId}" not present in locales/en/risks.json`
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
          // just warn for now
          console.warn(`Warning: ${pool.id} : Asset ${assetId} not in addressbook on ${chainId}`);
          // exitCode = 1;
        }
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
      if (pool.hasOwnProperty(field) && !isValidChecksumAddress(pool[field])) {
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

    if (new BigNumber(pool.totalSupply).isZero()) {
      if (pool.status !== 'eol') {
        console.error(`Error: ${pool.id} : Pool is empty`);
        exitCode = 1;
        if (!('emptyVault' in updates)) updates['emptyVault'] = {};
        updates.emptyVault[pool.id] = pool.earnContractAddress;
      } else {
        console.warn(`${pool.id} : eol pool is empty`);
      }
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
  boosts.forEach(boost => {
    if (!poolIds.has(boost.poolId)) {
      console.error(`Error: Boost ${boost.id}: Boost has non-existent pool id ${boost.poolId}.`);
      exitCode = 1;
    }
  });

  // Gov Pools
  govPools.forEach(pool => {
    if (!pool.strategyTypeId) {
      console.error(`Error: ${pool.id} : strategyTypeId missing gov strategy type`);
      exitCode = 1;
    } else if (!validGovStrategyIds.includes(pool.strategyTypeId)) {
      console.error(
        `Error: ${pool.id} : strategyTypeId invalid, "StrategyDescription-Gov-${pool.strategyTypeId}" not present in locales/en/risks.json`
      );
      exitCode = 1;
    }
  });

  if (!isEmpty(updates)) {
    exitCode = 1;
  }

  console.log(`${chainId} active pools: ${activePools}/${pools.length}\n`);

  return { chainId, exitCode, updates };
};

// Validation helpers. These only log for now, could throw error if desired.
const isKeeperCorrect = (pool, chain, chainKeeper, updates) => {
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

const isStratOwnerCorrect = (pool, chain, owner, updates) => {
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

const isVaultOwnerCorrect = (pool, chain, owner, updates) => {
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

const isBeefyFeeRecipientCorrect = (pool, chain, recipient, updates) => {
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

    if (pool.stratOwner in updates.beefyFeeRecipient[chain]) {
      updates.beefyFeeRecipient[chain][pool.stratOwner].push(pool.strategy);
    } else {
      updates.beefyFeeRecipient[chain][pool.stratOwner] = [pool.strategy];
    }
  }

  return updates;
};

const isBeefyFeeConfigCorrect = (pool, chain, feeConfig, updates) => {
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

    if (pool.stratOwner in updates.beefyFeeConfig[chain]) {
      updates.beefyFeeConfig[chain][pool.stratOwner].push(pool.strategy);
    } else {
      updates.beefyFeeConfig[chain][pool.stratOwner] = [pool.strategy];
    }
  }

  return updates;
};

const isHarvestOnDepositCorrect = (pool, chain, updates) => {
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

    if (pool.harvestOnDeposit in updates.harvestOnDeposit[chain]) {
      updates.harvestOnDeposit[chain][pool.harvestOnDeposit].push(pool.harvestOnDeposit);
    } else {
      updates.harvestOnDeposit[chain][pool.harvestOnDeposit] = [pool.harvestOnDeposit];
    }
  }

  return updates;
};

// Helpers to populate required addresses.

type VaultConfigWithVaultData = VaultConfig & {
  strategy: string | undefined;
  vaultOwner: string | undefined;
  totalSupply: string | undefined;
};
const populateVaultsData = async (
  chain,
  pools: VaultConfig[],
  web3
): Promise<VaultConfigWithVaultData[]> => {
  const multicall = new MultiCall(web3, addressBook[chain].platforms.beefyfinance.multicall);

  const calls = pools.map(pool => {
    const vaultContract = new web3.eth.Contract(
      StandardVaultAbi as unknown as AbiItem[],
      pool.earnContractAddress
    );
    return {
      strategy: vaultContract.methods.strategy(),
      owner: vaultContract.methods.owner(),
      totalSupply: vaultContract.methods.totalSupply(),
    };
  });

  const [results] = await multicall.all([calls]);

  return pools.map((pool, i) => {
    return {
      ...pool,
      strategy: results[i].strategy,
      vaultOwner: results[i].owner,
      totalSupply: results[i].totalSupply,
    };
  });
};

type VaultConfigWithStrategyData = VaultConfigWithVaultData & {
  keeper: string | undefined;
  beefyFeeRecipient: string | undefined;
  beefyFeeConfig: string | undefined;
  stratOwner: string | undefined;
  harvestOnDeposit: boolean | undefined;
};
const populateStrategyData = async (
  chain,
  pools: VaultConfigWithVaultData[],
  web3
): Promise<VaultConfigWithStrategyData[]> => {
  const multicall = new MultiCall(web3, addressBook[chain].platforms.beefyfinance.multicall);

  const calls = pools.map(pool => {
    const stratContract = new web3.eth.Contract(strategyABI, pool.strategy);
    return {
      keeper: stratContract.methods.keeper(),
      beefyFeeRecipient: stratContract.methods.beefyFeeRecipient(),
      beefyFeeConfig: stratContract.methods.beefyFeeConfig(),
      owner: stratContract.methods.owner(),
      harvestOnDeposit: stratContract.methods.harvestOnDeposit(),
    };
  });

  const [results] = await multicall.all([calls]);

  return pools.map((pool, i) => {
    return {
      ...pool,
      keeper: results[i].keeper,
      beefyFeeRecipient: results[i].beefyFeeRecipient,
      beefyFeeConfig: results[i].beefyFeeConfig,
      stratOwner: results[i].owner,
      harvestOnDeposit: results[i].harvestOnDeposit,
    };
  });
};

const override = pools => {
  Object.keys(overrides).forEach(id => {
    pools
      .filter(p => p.id.includes(id))
      .forEach(pool => {
        const override = overrides[id];
        Object.keys(override).forEach(key => {
          pool[key] = override[key];
        });
      });
  });
  return pools;
};

validatePools()
  .then(exitCode => process.exit(exitCode))
  .catch(err => {
    console.error(err);
    process.exit(-1);
  });
