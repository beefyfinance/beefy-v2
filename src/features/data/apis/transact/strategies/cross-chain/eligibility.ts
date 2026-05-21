import type BigNumber from 'bignumber.js';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import { allFulfilled } from '../../../../../../helpers/promises.ts';
import type { ChainEntity } from '../../../../entities/chain.ts';
import type { TokenEntity } from '../../../../entities/token.ts';
import type { VaultEntity } from '../../../../entities/vault.ts';
import { isVaultActive } from '../../../../entities/vault.ts';
import { selectUserVaultBalanceInShareTokenIncludingBoosts } from '../../../../selectors/balance.ts';
import { selectVaultById } from '../../../../selectors/vaults.ts';
import type { BeefyState } from '../../../../store/types.ts';
import { getTransactApi } from '../../../instances.ts';
import { getSupportedChainIds, isChainSupported } from '../../cctp/CCTPProvider.ts';
import { isComposableStrategy, isZapTransactHelpers } from '../IStrategy.ts';
import type { ZapStrategyConfig } from '../strategy-configs.ts';

export async function vaultAcceptsTokenDeposit(
  vaultId: VaultEntity['id'],
  state: BeefyState,
  token: TokenEntity
): Promise<boolean> {
  const vault = selectVaultById(state, vaultId);
  if (!vault) return false;
  if (!isVaultActive(vault)) return false;
  if (!('depositTokenAddress' in vault)) return false;
  // Plain CLMs are not v2v destinations: deposit goes through gov/vault-composer wrappers instead.
  if (vault.type === 'cowcentrated') return false;

  if (vault.depositTokenAddress.toLowerCase() === token.address.toLowerCase()) return true;

  return anyComposableStrategyAccepts(vaultId, state, token, 'deposit');
}

// Mirror of vaultAcceptsTokenDeposit minus the active check — EOL vaults must still be exitable.
export async function vaultCanWithdrawToToken(
  vaultId: VaultEntity['id'],
  state: BeefyState,
  token: TokenEntity
): Promise<boolean> {
  const vault = selectVaultById(state, vaultId);
  if (!vault) return false;
  if (!('depositTokenAddress' in vault)) return false;

  if (vault.depositTokenAddress.toLowerCase() === token.address.toLowerCase()) return true;

  return anyComposableStrategyAccepts(vaultId, state, token, 'withdraw');
}

async function anyComposableStrategyAccepts(
  vaultId: VaultEntity['id'],
  state: BeefyState,
  token: TokenEntity,
  direction: 'deposit' | 'withdraw'
): Promise<boolean> {
  const vault = selectVaultById(state, vaultId);
  if (!vault?.zaps?.length) return false;

  // Skip basic IZapStrategy zaps; isComposableStrategy would discard them post-load.
  const eligibilityZap = (z: ZapStrategyConfig) =>
    z.strategyId !== 'reward-pool-to-vault' && z.strategyId !== 'conic';
  if (!vault.zaps.some(eligibilityZap)) return false;

  const api = await getTransactApi();
  const helpers = await api.getHelpersForVault(vaultId, () => state);
  if (!isZapTransactHelpers(helpers)) return false;

  const strategies = await api.getZapStrategiesForVault(helpers, eligibilityZap);
  const composables = strategies.filter(isComposableStrategy);
  if (composables.length === 0) return false;

  const verdicts = await allFulfilled(
    composables.map(s =>
      direction === 'deposit' ? s.canAcceptTokenAsDeposit(token) : s.canEmitTokenAsWithdraw(token)
    )
  );
  return verdicts.some(Boolean);
}

// Includes boost stakes (not bridged or pending) so src-vault candidates surface even when the user is currently staking.
export function userHasPositionIn(
  vaultId: VaultEntity['id'],
  state: BeefyState,
  walletAddress: string | undefined
): boolean {
  if (!walletAddress) return false;
  const shares: BigNumber = selectUserVaultBalanceInShareTokenIncludingBoosts(
    state,
    vaultId,
    walletAddress
  );
  return shares.gt(BIG_ZERO);
}

export function isCrossChainHopEligible(
  pageChainId: ChainEntity['id'],
  otherChainId: ChainEntity['id']
): boolean {
  if (pageChainId === otherChainId) return false;
  return isChainSupported(otherChainId);
}

// Chains whose user-balance state must be loaded before v2v deposit enumeration can produce a complete list:
// destination chain (same-chain v2v), plus all CCTP chains only when destination is CCTP-eligible (cross-chain v2v).
export function getV2VRelevantChainsFor(
  state: BeefyState,
  vaultId: VaultEntity['id']
): ChainEntity['id'][] {
  const vault = selectVaultById(state, vaultId);
  if (!vault) return [];
  return isChainSupported(vault.chainId) ? getSupportedChainIds() : [vault.chainId];
}
