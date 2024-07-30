import { AddressBookChainId } from '../../../../common/config';
import { Address, decodeEventLog, parseAbiItem, toEventHash } from 'viem';
import { getBlockExplorerForChain } from '../../../lib/block-explorer';
import { isFulfilledResult } from '../../../utils/promise';
import { isDefined } from '../../../utils/typeguards';
import { getRpcClient } from '../../../utils/rpc';

const proxyCreatedEvent = parseAbiItem('event ProxyCreated(address proxy)');
const proxyCreatedEventAbi = [proxyCreatedEvent];
const proxyCreatedEventTopic = toEventHash(proxyCreatedEvent);
const vaultAbi = [parseAbiItem('function want() public view returns (address)')];

export async function getVaultsFromFactory(chainId: AddressBookChainId, factoryAddress: Address) {
  const blockExplorer = getBlockExplorerForChain(chainId);
  const proxyCreatedLogs = await blockExplorer.getLogs(factoryAddress, [proxyCreatedEventTopic]);
  const vaultAddresses = proxyCreatedLogs.result
    .map(log =>
      decodeEventLog({
        abi: proxyCreatedEventAbi,
        eventName: 'ProxyCreated',
        data: log.data,
        strict: true,
        topics: log.topics,
      })
    )
    .map(log => log.args.proxy);
  if (!vaultAddresses.length) {
    return [];
  }

  const client = getRpcClient(chainId);
  const wantAddresses = await Promise.allSettled(
    vaultAddresses.map(address =>
      client.readContract({
        address,
        functionName: 'want',
        abi: vaultAbi,
      })
    )
  );
  return wantAddresses
    .map((wantAddress, i) =>
      isFulfilledResult(wantAddress)
        ? {
            vaultAddress: vaultAddresses[i],
            wantAddress: wantAddress.value,
          }
        : undefined
    )
    .filter(isDefined);
}
