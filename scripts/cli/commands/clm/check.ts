import type { Command } from '../../types';
import { AddressBookChainId, allChainIds, appToAddressBookId } from '../../../common/config';
import { getVaultsConfig } from '../../lib/config/vault';
import { groupBy } from 'lodash';
import { pConsole, theme } from '../../utils/console';
import { select } from '@inquirer/prompts';
import { CheckerType, IChecker, Result, Source } from './checks/types';
import { getChecker, getCheckers } from './checks';
import { promptTrim } from '../../utils/prompt';

export type CommandArgs = {};

const command: Command<CommandArgs> = {
  args: {},
  description: 'Check for CLM configuration errors',
  run: async (_: CommandArgs) => {
    const checkers = await getCheckers();
    pConsole.info('Available checkers:');
    checkers.forEach(checker =>
      pConsole.ulItem(theme.bold(checker.type), theme.description(`- ${checker.description}`))
    );

    const results: Result[] = [];
    for (const chainId of allChainIds) {
      results.push(...(await checkChain(appToAddressBookId(chainId), checkers)));
    }

    if (results.length > 0) {
      pConsole.error('Some issues were found:');
      await processResults(results);
    }
  },
};

async function checkChain(chainId: AddressBookChainId, checkers: IChecker[]) {
  const chainVaults = await getVaultsConfig(chainId);
  const clms = chainVaults.filter(
    vault => vault.type === 'cowcentrated' && vault.status === 'active'
  );
  if (clms.length === 0) {
    return [];
  }

  const results: Result[] = [];
  for (const clm of clms) {
    const pool = chainVaults.find(
      pool => pool.type === 'gov' && pool.tokenAddress === clm.earnContractAddress
    );
    const vault = chainVaults.find(
      vault => vault.type === 'standard' && vault.tokenAddress === clm.earnContractAddress
    );
    const source: Source = {
      id: clm.id,
      chainId,
      clm,
      pool,
      vault,
    };
    for (const checker of checkers) {
      const result = await checker.check(source);
      if (result) {
        results.push(result);
      }
    }
  }

  return results;
}

async function processResults(results: Result[]) {
  const groupedResults = groupBy(results, r => r.type);
  const topLevelChoices = [
    ...Object.entries(groupedResults).map(([type, results]) => {
      return {
        name: promptTrim(
          `${type} (${results.length}) ${theme.description(
            results.map(r => r.source.id).join(', ')
          )}`
        ),
        value: results[0].type,
        short: `${type} (${results.length})`,
      };
    }),
    { name: 'Exit', value: '__exit' as const },
  ];

  let state: 'top' | 'group' | 'exit' = 'top';
  let group: CheckerType | undefined;
  do {
    switch (state) {
      case 'top': {
        const response = await select<CheckerType | '__exit'>({
          message: 'Select a group to view',
          choices: topLevelChoices,
        });
        if (response === '__exit') {
          state = 'exit';
        } else {
          state = 'group';
          group = response;
        }
        break;
      }
      case 'group': {
        if (!group) {
          state = 'top';
          break;
        }
        const groupResults = groupedResults[group]!;
        pConsole.error(group);
        pConsole.info(`Affected CLMS: ${groupResults.map(r => r.source.id).join(', ')}`);

        const checker = await getChecker(group);
        const response = await checker.groupPrompt(groupResults);
        // TODO recalculate in case anything changed?
        if (response === 'back') {
          state = 'top';
        } else {
          state = 'exit';
        }
        break;
      }
    }
  } while (state !== 'exit');
}

export default command;
