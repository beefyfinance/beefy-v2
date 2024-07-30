import { AddressBookChainId } from '../../../../common/config';
import { Address, decodeEventLog, parseAbiItem, toEventHash } from 'viem';
import { getBlockExplorerForChain } from '../../../lib/block-explorer';
import { isFulfilledResult } from '../../../utils/promise';
import { isDefined } from '../../../utils/typeguards';
import { getRpcClient } from '../../../utils/rpc';

const proxyCreatedEvent = parseAbiItem('event ProxyCreated(string rewardPoolName, address proxy)');
const proxyCreatedEventAbi = [proxyCreatedEvent];
const proxyCreatedEventTopic = toEventHash(proxyCreatedEvent);
const rewardPoolAbi = [parseAbiItem('function stakedToken() public view returns (address)')];

export async function getRewardPoolsFromFactory(
  chainId: AddressBookChainId,
  factoryAddress: Address
) {
  const blockExplorer = getBlockExplorerForChain(chainId);
  const proxyCreatedLogs = await blockExplorer.getLogs(factoryAddress, [proxyCreatedEventTopic]);
  const rewardPoolAddresses = proxyCreatedLogs.result
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
  if (!rewardPoolAddresses.length) {
    return [];
  }

  const client = getRpcClient(chainId);
  const stakedTokens = await Promise.allSettled(
    rewardPoolAddresses.map(address =>
      client.readContract({
        address,
        functionName: 'stakedToken',
        abi: rewardPoolAbi,
      })
    )
  );
  return stakedTokens
    .map((stakedToken, i) =>
      isFulfilledResult(stakedToken)
        ? {
            poolAddress: rewardPoolAddresses[i],
            stakedTokenAddress: stakedToken.value,
          }
        : undefined
    )
    .filter(isDefined);
}
