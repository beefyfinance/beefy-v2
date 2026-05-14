import type BigNumber from 'bignumber.js';
import { BIG_ZERO } from '../../../../../../helpers/big-number.ts';
import { allFulfilled } from '../../../../../../helpers/promises.ts';
import type { ChainEntity } from '../../../../entities/chain.ts';
import type { TokenEntity } from '../../../../entities/token.ts';
import type { VaultEntity } from '../../../../entities/vault.ts';
import { isVaultActive } from '../../../../entities/vault.ts';
import { selectUserVaultBalanceInShareTokenIncludingDisplaced } from '../../../../selectors/balance.ts';
import { selectVaultById } from '../../../../selectors/vaults.ts';
import type { BeefyState } from '../../../../store/types.ts';
import { getTransactApi } from '../../../instances.ts';
import { isChainSupported } from '../../cctp/CCTPProvider.ts';
import { isComposableStrategy, isZapTransactHelpers } from '../IStrategy.ts';
import type { ZapStrategyConfig } from '../strategy-configs.ts';

export async function vaultAcceptsBridgeTokenDeposit(
  vaultId: VaultEntity['id'],
  state: BeefyState,
  bridgeToken: TokenEntity
): Promise<boolean> {
  const vault = selectVaultById(state, vaultId);
  if (!vault) return false;
  if (!isVaultActive(vault)) return false;
  if (!('depositTokenAddress' in vault)) return false;
  // Plain CLMs are not v2v destinations: deposit goes through gov/vault-composer wrappers instead.
  if (vault.type === 'cowcentrated') return false;

  if (vault.depositTokenAddress.toLowerCase() === bridgeToken.address.toLowerCase()) return true;

  return anyComposableStrategyAccepts(vaultId, state, bridgeToken, 'deposit');
}

// Mirror of vaultAcceptsBridgeTokenDeposit minus the active check — EOL vaults are still allowed to exit via the bridge.
export async function vaultCanWithdrawToBridgeToken(
  vaultId: VaultEntity['id'],
  state: BeefyState,
  bridgeToken: TokenEntity
): Promise<boolean> {
  const vault = selectVaultById(state, vaultId);
  if (!vault) return false;
  if (!('depositTokenAddress' in vault)) return false;

  if (vault.depositTokenAddress.toLowerCase() === bridgeToken.address.toLowerCase()) return true;

  return anyComposableStrategyAccepts(vaultId, state, bridgeToken, 'withdraw');
}

async function anyComposableStrategyAccepts(
  vaultId: VaultEntity['id'],
  state: BeefyState,
  bridgeToken: TokenEntity,
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
      direction === 'deposit' ?
        s.canAcceptTokenAsDeposit(bridgeToken)
      : s.canEmitTokenAsWithdraw(bridgeToken)
    )
  );
  return verdicts.some(Boolean);
}

// Includes displaced (boosted/bridged) shares so src-vault candidates surface even when the user is currently staking.
export function userHasPositionIn(
  vaultId: VaultEntity['id'],
  state: BeefyState,
  walletAddress: string | undefined
): boolean {
  if (!walletAddress) return false;
  const shares: BigNumber = selectUserVaultBalanceInShareTokenIncludingDisplaced(
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
