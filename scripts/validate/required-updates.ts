import { AddressBookChainId } from '../common/config';
import { get } from 'lodash';
import { AnyRequiredUpdate, UpdatesByType, UpdateTypeToContext } from './required-updates-types';
import chalk from 'chalk';
import { pconsole } from '../common/pconsole';

export class RequiredUpdates {
  protected readonly updates: Map<AddressBookChainId, AnyRequiredUpdate[]> = new Map();

  public add<TType extends AnyRequiredUpdate['type']>(
    chainId: AddressBookChainId,
    vaultId: string,
    type: TType,
    context: UpdateTypeToContext<TType>
  ) {
    const update = { type, vaultId, chainId, context } as AnyRequiredUpdate;
    const chainUpdates = this.updates.get(chainId);
    if (chainUpdates) {
      chainUpdates.push(update);
    } else {
      this.updates.set(chainId, [update]);
    }
  }

  public hasAny() {
    return this.updates.size > 0;
  }

  public hasChain(chainId: AddressBookChainId) {
    return this.updates.has(chainId);
  }

  public makeChainAddFunction(chainId: AddressBookChainId) {
    return <TType extends AnyRequiredUpdate['type']>(
      vaultId: string,
      type: TType,
      context: UpdateTypeToContext<TType>
    ) => {
      this.add(chainId, vaultId, type, context);
      return false as const;
    };
  }

  public prettyPrint() {
    if (!this.hasAny()) {
      return;
    }

    for (const [chainId, updates] of this.updates) {
      this.printChainHeader(chainId);
      const updatesByType = updates.reduce((acc, update) => {
        acc[update.type] ??= {
          __type: update.type,
          updates: [],
        };
        acc[update.type].updates.push(update);
        return acc;
      }, {} as { __type: AnyRequiredUpdate['type']; updates: AnyRequiredUpdate[] }) as UpdatesByType;

      for (const byType of Object.values(updatesByType)) {
        if (!byType || byType.updates.length === 0) {
          continue;
        }

        switch (byType.__type) {
          case 'remove-empty-vault': {
            this.printTypeHeader('Remove Empty Vaults', byType.updates.length);
            this.printTable(byType.updates, ['vaultId', 'context.earnContractAddress']);
            break;
          }
          case 'enable-harvest-on-deposit': {
            this.printTypeHeader('Enable Harvest on Deposit', byType.updates.length);
            this.printTable(byType.updates, ['vaultId', 'context.from']);
            break;
          }
          case 'fix-fee-config-address': {
            this.printTypeHeader('Fix Fee Config Address', byType.updates.length);
            this.printTable(byType.updates, [
              'vaultId',
              'context.strategyOwner',
              'context.strategyAddress',
              'context.from',
              'context.to',
            ]);
            // byType.updates.forEach(u =>
            //   console.log(`'${u.vaultId}': { value: '${u.context.from}', reason: '' },`)
            // );
            break;
          }
          case 'fix-fee-recipient-address': {
            this.printTypeHeader('Fix Fee Recipient Address', byType.updates.length);
            this.printTable(byType.updates, [
              'vaultId',
              'context.strategyOwner',
              'context.strategyAddress',
              'context.from',
              'context.to',
            ]);
            break;
          }
          case 'fix-reward-pool-owner': {
            this.printTypeHeader('Fix Reward Pool Owner', byType.updates.length);
            this.printTable(byType.updates, [
              'vaultId',
              'context.earnContractAddress',
              'context.from',
              'context.to',
            ]);
            break;
          }
          case 'fix-vault-owner': {
            this.printTypeHeader('Fix Vault Owner', byType.updates.length);
            this.printTable(byType.updates, [
              'vaultId',
              'context.earnContractAddress',
              'context.from',
              'context.to',
            ]);
            byType.updates.forEach(u =>
              console.log(`'${u.vaultId}': { value: '${u.context.from}', reason: '' },`)
            );
            break;
          }
          case 'fix-strategy-owner': {
            this.printTypeHeader('Fix Strategy Owner', byType.updates.length);
            this.printTable(byType.updates, [
              'vaultId',
              'context.strategyAddress',
              'context.from',
              'context.to',
            ]);
            byType.updates.forEach(u =>
              console.log(`'${u.vaultId}': { value: '${u.context.from}', reason: '' },`)
            );
            break;
          }
          case 'fix-strategy-keeper': {
            this.printTypeHeader('Fix Strategy Keeper', byType.updates.length);
            this.printTable(byType.updates, [
              'vaultId',
              'context.strategyOwner',
              'context.strategyAddress',
              'context.from',
              'context.to',
            ]);
            break;
          }
          case 'fix-vault-field': {
            this.printTypeHeader('Fix Vault Field', byType.updates.length);
            this.printTable(byType.updates, [
              'vaultId',
              'context.field',
              'context.from',
              'context.to',
            ]);
            break;
          }
          default: {
            // @ts-expect-error -- switch should be exhaustive
            throw new Error(`Unknown update type: ${byType.__type}`);
          }
        }
      }
    }
  }

  protected printChainHeader(chainId: AddressBookChainId) {
    console.log('');
    console.log(chalk.bold(chainId));
  }

  protected printTypeHeader(title: string, count: number) {
    console.log(`${chalk.dim(`${count} x`)} ${title}`);
  }

  protected printTable<T extends Record<string, unknown>>(data: T[], paths: string[]) {
    const picked = data.map(row =>
      Object.fromEntries(paths.map(path => [this.pathToKey(path), get(row, path)]))
    );
    console.table(picked);
  }

  protected pathToKey(path: string): string {
    return path.replace(/^context\./, '');
  }
}
