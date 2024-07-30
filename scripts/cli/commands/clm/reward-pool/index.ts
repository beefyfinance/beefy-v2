import { AddressBookChainId } from '../../../../common/config';
import { addressBook } from 'blockchain-addressbook';
import { Address, isAddress } from 'viem';
import { pConsole } from '../../../utils/console';
import { getRewardPoolsFromFactory } from './factory';

export async function findPoolForClm(
  chainId: AddressBookChainId,
  clmAddress: string
): Promise<Address | undefined> {
  const chainBook = addressBook[chainId];
  const rewardPoolFactory = chainBook.platforms.beefyfinance.clmRewardPoolFactory;
  if (!rewardPoolFactory || !isAddress(rewardPoolFactory)) {
    pConsole.warn(`No clmRewardPoolFactory in ${chainId} address book`);
    return undefined;
  }

  try {
    const poolsWithStakedToken = await getRewardPoolsFromFactory(chainId, rewardPoolFactory);
    const matchingPool = poolsWithStakedToken.find(pool => pool.stakedTokenAddress === clmAddress);
    if (matchingPool) {
      return matchingPool.poolAddress;
    }
  } catch (err) {
    pConsole.error('Failed to check for reward pool using block explorer', err);
    return undefined;
  }

  return undefined;
}
