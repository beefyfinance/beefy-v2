import type { VaultEntity } from '../../../entities/vault.ts';
import { selectChainHasFeature } from '../../../selectors/chains.ts';
import type { BeefyState } from '../../../store/types.ts';
import type { DepositOption, WithdrawOption } from '../transact-types.ts';
import { isDirectVaultOption } from './options.ts';

/** Removes options that swap on chains without prices; direct vault options and LP breaks survive */
export function filterUnpricedSwapOptions<T extends DepositOption | WithdrawOption>(
  state: BeefyState,
  vault: VaultEntity,
  options: T[]
): T[] {
  if (selectChainHasFeature(state, vault.chainId, 'price')) {
    return options;
  }
  return options.filter(option => isDirectVaultOption(option) || isBreakLpOption(option));
}

function isBreakLpOption(option: DepositOption | WithdrawOption): boolean {
  return (option.strategyId === 'uniswap-v2' || option.strategyId === 'solidly') && !option.swapVia;
}
