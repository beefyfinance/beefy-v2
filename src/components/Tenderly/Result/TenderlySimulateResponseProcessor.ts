import type {
  TenderlyCallTrace,
  TenderlySimulateResponse,
  TenderlySimulateResponseContract,
} from '../../../features/data/apis/tenderly/types.ts';
import { StackEntry } from './StackEntry.ts';
import { formatAddressShort } from '../../../helpers/format.ts';

export class TenderlySimulateResponseProcessor {
  private readonly contracts: Record<string, TenderlySimulateResponseContract>;

  constructor(protected response: TenderlySimulateResponse) {
    this.contracts = this.getContracts(response.contracts);
  }

  getReverts() {
    const { transaction } = this.response;
    const callTrace = !transaction.status ? transaction?.transaction_info?.call_trace : undefined;

    if (callTrace) {
      const walk = (
        trace: TenderlyCallTrace,
        stack: Array<StackEntry>,
        reverts: Array<{
          error: string;
          stack: StackEntry[];
        }>
      ) => {
        const lastStack = stack[stack.length - 1];

        if (trace.error_op === 'REVERT' && trace.calls === null) {
          const reasonStack = stack.findLast(s => !!s.errorReason);
          reverts.push({
            error: reasonStack ? reasonStack.errorReason || trace.error : trace.error,
            stack: stack.slice(),
          });
        }

        if (trace.calls && trace.calls.length) {
          trace.calls.forEach((call, i) =>
            walk(
              call,
              [...stack, new StackEntry(`${lastStack.id}.${i}`, call, this.contracts)],
              reverts
            )
          );
        }

        return reverts;
      };

      return walk(callTrace, [new StackEntry('0', callTrace, this.contracts)], []);
    }

    return undefined;
  }

  protected getContracts(
    contracts: TenderlySimulateResponseContract[]
  ): Record<string, TenderlySimulateResponseContract> {
    const byAddress = contracts.reduce(
      (acc, c) => {
        acc[c.address.toLowerCase()] = {
          ...c,
          contract_name: c.contract_name || formatAddressShort(c.address),
        };
        return acc;
      },
      {} as Record<string, TenderlySimulateResponseContract>
    );
    const proxies = contracts.filter(c => c.standard === 'eip1167');
    for (const proxy of proxies) {
      const implementation = contracts.find(
        c =>
          c.contract_name === proxy.contract_name &&
          !c.standard &&
          c.address.toLowerCase() !== proxy.address.toLowerCase()
      );
      byAddress[proxy.address.toLowerCase()].contract_name = `${
        byAddress[proxy.address.toLowerCase()].contract_name
      } (proxy)`;
      if (implementation) {
        byAddress[implementation.address.toLowerCase()].contract_name = `${
          implementation.contract_name ||
          proxy.contract_name ||
          formatAddressShort(implementation.address)
        } (implementation)`;
      }
    }
    return byAddress;
  }
}
