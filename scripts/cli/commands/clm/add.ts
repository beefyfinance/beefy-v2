import { addressBook, Chain as BookChain, TokenWithId } from 'blockchain-addressbook';
import { confirm, input, select, Separator } from '@inquirer/prompts';
import { Address, getAddress, getContract, PublicClient } from 'viem';
import type { Command } from '../../types';
import { AddressBookChainId, addressBookToAppId, appToAddressBookId } from '../../../common/config';
import { last } from 'lodash';
import { getUnixTime } from 'date-fns';
import { BeefyCowcentratedLiquidityVaultAbi } from '../../../../src/config/abi/BeefyCowcentratedLiquidityVaultAbi';
import { getRpcClient } from '../../utils/rpc';
import { getStrategy, isRewardPoolStrategy } from './strategies';
import { Strategy } from './strategies/types';
import { createPlatformPrompt } from './prompts/platform';
import { getPlatforms } from '../../lib/config/platform';
import { VaultRiskId } from '../../lib/config/risk';
import { createVaultRisksPrompt } from './prompts/risks';
import { getProviderPool } from './provider-pool';
import { createStrategyTypePrompt } from './prompts/strategy-type';
import { getCowcentratedStrategyIds } from '../../lib/config/strategy-type';
import type { VaultConfig } from '../../../../src/features/data/apis/config-types';
import { addVault, getVault, getVaultsConfig } from '../../lib/config/vault';
import { createCachedFactory, createFactory } from '../../utils/factory';
import { isDefined, isFieldDefined } from '../../utils/typeguards';
import { pConsole, theme } from '../../utils/console';
import { loadCommand } from '../../commands';
import { sortVaultKeys } from '../../../common/vault-fields';
import { findPoolForClm } from './reward-pool';
import { findVaultForClm } from './vault';
import { envBoolean } from '../../utils/env';
import { ProviderPool } from './provider-pool/types';

export type CommandArgs = {
  address: string;
  chain: string;
  provider?: string;
  risks?: string[];
  strategy?: string;
  name?: string;
  id?: string;
  oracleId?: string;
  points?: boolean;
  pool?: string;
  vault?: string;
  dryRun?: boolean;
  disableAutoFind?: boolean;
};

const command: Command<CommandArgs> = {
  args: {
    address: {
      type: String,
      alias: 'a',
      description: 'CLM Address (earnContractAddress)',
    },
    chain: {
      type: String,
      alias: 'c',
      description: 'CLM Chain (network)',
    },
    provider: {
      optional: true,
      type: String,
      alias: 'p',
      description: 'CLM Token Provider ID (tokenProviderId/platformId)',
    },
    risks: {
      optional: true,
      type: String,
      alias: 'r',
      description: 'CLM Risks (risks)',
      multiple: true,
    },
    strategy: {
      optional: true,
      type: String,
      alias: 's',
      description: 'CLM Strategy Type ID (strategyTypeId)',
    },
    id: {
      optional: true,
      type: String,
      alias: 'i',
      description: 'CLM ID (id)',
    },
    name: {
      optional: true,
      type: String,
      alias: 'n',
      description: 'CLM Name (name)',
    },
    oracleId: {
      optional: true,
      type: String,
      alias: 'o',
      description: 'CLM price oracle (oracleId)',
    },
    points: {
      optional: true,
      type: Boolean,
      description: 'Whether this CLM is earning points (earningPoints)',
    },
    pool: {
      optional: true,
      type: String,
      description: 'Also add a CLM Pool using this address',
    },
    vault: {
      optional: true,
      type: String,
      description: 'Also add a CLM Vault using this address',
    },
    dryRun: {
      optional: true,
      type: Boolean,
      description: 'Do not write the modified config file',
    },
    disableAutoFind: {
      optional: true,
      type: Boolean,

      description: 'Disable auto finding of related pool and vault',
    },
  },
  description: 'Add a CLM',
  run: async (args: CommandArgs) => {
    await addClmCommand(args);
  },
};

export async function addClmCommand(args: CommandArgs) {
  let added = false;
  const chainId = appToAddressBookId(args.chain);
  const chainBook = addressBook[chainId];
  const address = getAddress(args.address);
  const existingVault = await getVault({
    network: addressBookToAppId(chainId),
    earnContractAddress: address,
  });
  if (existingVault) {
    if (args.dryRun) {
      pConsole.error(
        `${theme.bold('Dry run:')} Would have failed as CLM with that address already exists`
      );
    } else {
      throw new Error(`CLM already exists: ${existingVault.id}`);
    }
  }

  const client = getRpcClient(chainId);
  const clmContract = getContract({
    client,
    address,
    abi: BeefyCowcentratedLiquidityVaultAbi,
  });
  const [poolAddress, depositTokenAddresses, receiptName, receiptSymbol, strategyAddress] =
    await Promise.all([
      clmContract.read.want(),
      clmContract.read.wants(),
      clmContract.read.name(),
      clmContract.read.symbol(),
      clmContract.read.strategy(),
    ]);
  if (depositTokenAddresses.length !== 2) {
    throw new Error(`vault.wants(): expected 2, got ${depositTokenAddresses.length}`);
  }

  const strategy = await getStrategy(client, strategyAddress);
  const maybeDepositTokens = depositTokenAddresses.map((tokenAddress): TokenWithId | undefined => {
    const token = chainBook.tokenAddressMap[tokenAddress];
    if (!token) {
      return undefined;
    }

    if (token.id === 'WNATIVE') {
      const maybeNamedToken = chainBook.tokens[token.symbol];
      if (maybeNamedToken && maybeNamedToken.address === tokenAddress) {
        return { ...maybeNamedToken, id: token.symbol };
      }

      const maybeOtherId = Object.entries(chainBook.tokens).find(
        ([id, t]) => id !== token.id && t.address === tokenAddress
      );
      if (maybeOtherId) {
        return { ...maybeOtherId[1], id: maybeOtherId[0] };
      }
    }

    return token;
  });
  const missingTokens = depositTokenAddresses
    .map((address, index) => (isDefined(maybeDepositTokens[index]) ? undefined : address))
    .filter(isDefined);
  if (missingTokens.length) {
    throw new Error(`Tokens not found in address book: ${missingTokens.join(', ')}`);
  }
  const depositTokens = maybeDepositTokens as [TokenWithId, TokenWithId];
  const assetTokens = getAssetTokens(depositTokens, chainBook);

  const id = await getVaultId(args.id, receiptName);
  const name = await getVaultName(args.name, receiptName, depositTokens, assetTokens);
  const tokenProviderId = await getTokenProviderId(args.provider, strategy, chainId, receiptName);
  const pool = await getProviderPool(chainId, poolAddress, tokenProviderId);
  const risks = await getVaultRisks(args.risks);
  const strategyTypeId = await getStrategyTypeId(args.strategy, pool);
  const oracleId = args.oracleId || id;
  const token = await getTokenId(poolAddress, chainId, name);

  const clm: VaultConfig = {
    id,
    name,
    type: 'cowcentrated',
    token,
    tokenAddress: poolAddress,
    tokenDecimals: 18,
    tokenProviderId,
    depositTokenAddresses: [...depositTokenAddresses],
    earnedToken: receiptSymbol,
    earnedTokenAddress: address,
    earnContractAddress: address,
    oracle: 'lps',
    oracleId,
    status: 'active',
    createdAt: getUnixTime(new Date()),
    platformId: tokenProviderId,
    assets: assetTokens.map(token => token.id),
    risks,
    strategyTypeId,
    network: addressBookToAppId(chainId),
    feeTier: pool.feeTier.toString(),
    zaps: [
      {
        strategyId: 'cowcentrated',
      },
    ],
  };

  if (args.points) {
    clm.earningPoints = true;
  }

  console.log(sortVaultKeys(clm));

  if (
    envBoolean('CLI_CLM_TEST', false) ||
    (await confirm({ message: 'Add this CLM?', default: true }))
  ) {
    if (args.dryRun) {
      if (await getVault(clm)) {
        pConsole.error(`${theme.bold('Dry run:')} Would have failed to add as CLM already exists`);
      } else {
        pConsole.info(`${theme.bold('Dry run:')} Would have added CLM`);
        added = true;
      }
    } else {
      await addVault(clm);
      added = true;
    }

    await maybeAddPool(
      args.pool,
      args.vault,
      client,
      chainId,
      clm,
      strategy,
      args.dryRun,
      args.disableAutoFind
    );
  }

  return { clm, added };
}

const getDepositTokenIds = createCachedFactory(
  async (chainId: AddressBookChainId) => {
    const vaults = await getVaultsConfig(chainId);
    return vaults.reduce((ids, vault) => {
      if (vault.tokenAddress) {
        ids[vault.tokenAddress] = vault.token;
      }
      return ids;
    }, {} as Record<string, string>);
  },
  chainId => chainId
);

async function getTokenId(tokenAddress: string, chainId: AddressBookChainId, vaultName: string) {
  const existingIds = await getDepositTokenIds(chainId);
  const existingId = existingIds[tokenAddress];
  if (existingId) {
    return existingId;
  }

  return vaultName;
}

function getAssetTokens(tokens: [TokenWithId, TokenWithId], chainBook: BookChain) {
  const wnative = chainBook.tokens.WNATIVE;
  const wnativeIndex = tokens.findLastIndex(token => token.address === wnative.address);

  // WNATIVE-X --> X-WNATIVE
  if (wnativeIndex === 0) {
    return [tokens[1], tokens[0]];
  }

  return tokens;
}

async function maybeAddPool(
  poolFromArgs: string | undefined,
  vaultFromArgs: string | undefined,
  client: PublicClient,
  chainId: AddressBookChainId,
  clm: VaultConfig,
  strategy: Strategy,
  dryRun?: boolean,
  disableAutoFind?: boolean
) {
  let poolAddress = poolFromArgs;
  if (!poolAddress && !disableAutoFind) {
    const maybePoolAddress = await findPool(client, chainId, clm, strategy);
    if (maybePoolAddress) {
      pConsole.info(`Found CLM pool at: ${maybePoolAddress}`);
      if (await confirm({ message: 'Add this CLM Pool too?', default: true })) {
        poolAddress = maybePoolAddress;
      }
    }
  }

  if (poolAddress) {
    const command = await loadCommand<{
      address: string;
      chain: string;
      vault?: string;
      dryRun?: boolean;
      disableAutoFind?: boolean;
    }>('clm:add-pool');
    await command.run({
      address: poolAddress,
      chain: chainId,
      vault: vaultFromArgs,
      dryRun,
      disableAutoFind,
    });
  } else {
    await maybeAddVault(vaultFromArgs, chainId, clm.earnContractAddress, dryRun, disableAutoFind);
  }
}

async function maybeAddVault(
  vaultFromArgs: string | undefined,
  chainId: AddressBookChainId,
  clmAddress: string,
  dryRun?: boolean,
  disableAutoFind?: boolean
) {
  let vaultAddress = vaultFromArgs;

  if (!vaultAddress && !disableAutoFind) {
    const maybeVaultAddress = await findVaultForClm(chainId, clmAddress);
    if (maybeVaultAddress) {
      pConsole.info(`Found CLM Vault at: ${maybeVaultAddress}`);
      if (await confirm({ message: 'Add this CLM Vault too?', default: true })) {
        vaultAddress = maybeVaultAddress;
      }
    }
  }

  if (vaultAddress) {
    const command = await loadCommand<{ address: string; chain: string; dryRun?: boolean }>(
      'clm:add-vault'
    );
    await command.run({ address: vaultAddress, chain: chainId, dryRun });
  }
}

async function findPool(
  client: PublicClient,
  chainId: AddressBookChainId,
  clm: VaultConfig,
  strategy: Strategy
): Promise<Address | undefined> {
  if (isRewardPoolStrategy(strategy)) {
    return await client.readContract({
      address: strategy.address,
      functionName: 'rewardPool',
      abi: strategy.config.abi,
    });
  }

  return findPoolForClm(chainId, clm.earnContractAddress);
}

function providerPoolToStrategyTypeId(pool: ProviderPool): string | undefined {
  return pool.strategyTypeId;
}

const getValidStrategyTypeIds = createFactory(async () => {
  const strategyTypes = await getCowcentratedStrategyIds();
  return new Set<string>(strategyTypes);
});

async function isValidStrategyTypeId(strategyTypeId: string): Promise<boolean> {
  const validStrategyTypeIds = await getValidStrategyTypeIds();
  return !!strategyTypeId && validStrategyTypeIds.has(strategyTypeId);
}

async function getStrategyTypeId(
  strategyTypeIdFromArgs: string | undefined | null,
  pool: ProviderPool
) {
  if (strategyTypeIdFromArgs) {
    if (await isValidStrategyTypeId(strategyTypeIdFromArgs)) {
      return strategyTypeIdFromArgs;
    }
    pConsole.warn(`Invalid Strategy Type ID from command line: ${strategyTypeIdFromArgs}`);
  }

  const strategyTypeIdFromPool = providerPoolToStrategyTypeId(pool);
  if (strategyTypeIdFromPool) {
    if (await isValidStrategyTypeId(strategyTypeIdFromPool)) {
      return strategyTypeIdFromPool;
    }
    pConsole.warn(`Invalid Strategy Type ID from pool config: ${strategyTypeIdFromPool}`);
  }

  const strategyTypePrompt = await createStrategyTypePrompt();
  return await strategyTypePrompt('Select Strategy Type Id');
}

async function getVaultRisks(risksFromArgs: string[] | undefined): Promise<VaultRiskId[]> {
  const prompt = await createVaultRisksPrompt(['CONTRACTS_VERIFIED']);
  return await prompt(risksFromArgs || []);
}

async function strategyToTokenProviderId(
  strategy: Strategy,
  chainId: AddressBookChainId,
  vaultReceiptName: string
): Promise<string | undefined> {
  const tokenProviderId = strategy.config.tokenProviderId;
  if (typeof tokenProviderId === 'function') {
    return await tokenProviderId(chainId, strategy.address, vaultReceiptName);
  }
  return tokenProviderId;
}

const getValidPlatformIds = createFactory(async () => {
  const platforms = await getPlatforms();
  return new Set(platforms.map(platform => platform.id));
});

async function isValidTokenProviderId(providerId: string): Promise<boolean> {
  const validPlatformIds = await getValidPlatformIds();
  return !!providerId && validPlatformIds.has(providerId);
}

async function getTokenProviderId(
  providerIdFromArgs: string | undefined | null,
  strategy: Strategy,
  chainId: AddressBookChainId,
  vaultReceiptName: string
) {
  if (providerIdFromArgs) {
    if (await isValidTokenProviderId(providerIdFromArgs)) {
      return providerIdFromArgs;
    }
    pConsole.warn(`Invalid Token Provider ID from command line: ${providerIdFromArgs}`);
  }

  const providerIdFromStrategy = await strategyToTokenProviderId(
    strategy,
    chainId,
    vaultReceiptName
  );
  if (providerIdFromStrategy) {
    if (await isValidTokenProviderId(providerIdFromStrategy)) {
      return providerIdFromStrategy;
    }
    pConsole.warn(`Invalid Token Provider ID from strategy config: ${providerIdFromStrategy})`);
  }

  const platformPrompt = createPlatformPrompt();
  const provider = await platformPrompt('Select Token Provider');
  return provider.id;
}

function receiptNameToVaultName(receiptName: string): string | undefined {
  const vaultName = last(receiptName.split(' '));
  if (!vaultName || vaultName.split('-').length !== 2) {
    return undefined;
  }
  return vaultName;
}

function vaultTokensToVaultName(tokens: TokenWithId[]): string | undefined {
  const vaultName = tokens.map(token => token.symbol).join('-');
  if (!vaultName || vaultName.split('-').length !== 2) {
    return undefined;
  }
  return vaultName;
}

function isValidVaultName(vaultName: string | undefined | null): vaultName is string {
  return !!vaultName && vaultName.length > 2 && vaultName.split('-').length === 2;
}

async function getVaultName(
  nameFromArgs: string | undefined | null,
  receiptName: string,
  depositTokens: TokenWithId[],
  assetTokens: TokenWithId[]
): Promise<string> {
  if (nameFromArgs) {
    if (isValidVaultName(nameFromArgs)) {
      return nameFromArgs;
    }
    pConsole.warn(`Invalid Vault Name from command line: ${nameFromArgs}`);
  }

  const nameFromReceipt = receiptNameToVaultName(receiptName);
  const nameFromReceiptChoice = {
    name: nameFromReceipt,
    description: `"${nameFromReceipt}" derived from vault.name() "${receiptName}"`,
  };
  const nameFromDepositTokens = vaultTokensToVaultName(depositTokens);
  const nameFromDepositTokensChoice = {
    name: nameFromDepositTokens,
    description: `"${nameFromDepositTokens}" derived from vault.wants() token symbols "${depositTokens
      .map(t => t.symbol)
      .join('", "')}"`,
  };
  const nameFromAssetTokens = vaultTokensToVaultName(assetTokens);
  const nameFromAssetTokensChoice = {
    name: nameFromAssetTokens,
    description: `"${nameFromAssetTokens}" derived from vault.wants() token symbols "${assetTokens
      .map(t => t.symbol)
      .join('", "')}" with native token last`,
  };
  const choices = [
    nameFromAssetTokensChoice,
    nameFromReceiptChoice,
    nameFromDepositTokensChoice,
  ].filter(isFieldDefined('name'));
  if (choices.length > 1 && choices.every(choice => choice.name === choices[0].name)) {
    return choices[0].name;
  }

  if (choices.length > 0) {
    if (envBoolean('CLI_CLM_TEST', false)) {
      return choices[0].name;
    }

    const selected = await select({
      message: 'Select Vault Name',
      choices: [
        ...choices.map(choice => ({ ...choice, value: choice.name })),
        new Separator(),
        { name: 'Enter manually', value: 'manual' },
      ],
      default: choices[0].name,
    });
    if (selected !== 'manual') {
      return selected;
    }
  }

  while (true) {
    const entered = await input({
      message: 'Enter Vault Name',
    });
    if (isValidVaultName(entered)) {
      return entered;
    }
  }
}

function receiptNameToVaultId(receiptName: string): string | undefined {
  const vaultId = receiptName
    .replaceAll(' ', '-')
    .toLowerCase()
    .replace(/^cow-([^-]+)-/, '$1-cow-');
  if (!isValidVaultId(vaultId)) {
    return undefined;
  }

  return vaultId;
}

function isValidVaultId(vaultId: string | undefined | null): vaultId is string {
  return !!vaultId && vaultId.length > 4 && vaultId.split('-').length >= 3;
}

async function getVaultId(
  idFromArgs: string | undefined | null,
  receiptName: string
): Promise<string> {
  if (idFromArgs) {
    if (isValidVaultId(idFromArgs)) {
      return idFromArgs;
    }
    pConsole.warn(`Invalid Vault ID from command line: ${idFromArgs}`);
  }

  const vaultId = receiptNameToVaultId(receiptName);
  if (isValidVaultId(vaultId)) {
    return vaultId;
  }

  while (true) {
    const entered = await input({
      message: 'Enter Vault ID',
    });
    if (isValidVaultId(entered)) {
      return entered;
    }
  }
}

export default command;
