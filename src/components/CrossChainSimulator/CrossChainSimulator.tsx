/**
 * Floating panel to force cross-chain zap scenarios for screenshots.
 *
 * Intentionally enabled in ALL build modes (this branch is a throwaway that never
 * merges to a dev/main branch), so it also works on production/preview builds.
 * Renders nothing unless a cross-chain-capable vault (chain in CCTP config with
 * USDC loaded) is currently open in the transact form. Picking a scenario seeds
 * Redux to force the exact Stepper / recovery UI — no wallet, tx, or bridge.
 */
import { type CSSProperties, memo, useEffect, useMemo, useState } from 'react';
import { CCTP_CONFIG } from '../../config/cctp/cctp-config.ts';
import { fetchAddressBookAction } from '../../features/data/actions/tokens.ts';
import type { ChainEntity } from '../../features/data/entities/chain.ts';
import {
  selectChainNativeToken,
  selectTokenByAddressOrUndefined,
} from '../../features/data/selectors/tokens.ts';
import { selectTransactVaultIdOrUndefined } from '../../features/data/selectors/transact.ts';
import { selectVaultByIdOrUndefined } from '../../features/data/selectors/vaults.ts';
import { useAppDispatch, useAppSelector } from '../../features/data/store/hooks.ts';
import { SCENARIOS, type Scenario } from './scenarios.ts';
import type { SimCtx } from './seed.ts';

const CCTP_CHAIN_IDS = Object.keys(CCTP_CONFIG.chains) as ChainEntity['id'][];

function pickSourceChain(destChainId: ChainEntity['id']): ChainEntity['id'] {
  const preferred: ChainEntity['id'][] = ['ethereum', 'arbitrum', 'base', 'optimism'];
  return (
    preferred.find(c => c !== destChainId && CCTP_CONFIG.chains[c]) ??
    CCTP_CHAIN_IDS.find(c => c !== destChainId) ??
    destChainId
  );
}

const panelStyle: CSSProperties = {
  position: 'fixed',
  bottom: '12px',
  right: '12px',
  zIndex: 9999,
  background: '#1b1d2a',
  color: '#fff',
  border: '1px solid #3a3d52',
  borderRadius: '8px',
  padding: '8px',
  font: '12px/1.4 monospace',
  boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
  maxWidth: '260px',
};

export const CrossChainSimulator = memo(function CrossChainSimulator() {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(SCENARIOS[0].id);

  const vaultId = useAppSelector(selectTransactVaultIdOrUndefined);
  const vault = useAppSelector(state =>
    vaultId ? selectVaultByIdOrUndefined(state, vaultId) : undefined
  );
  const destChainId = vault?.chainId;
  const sourceChainId = destChainId ? pickSourceChain(destChainId) : undefined;
  const destUsdcAddress = destChainId ? CCTP_CONFIG.chains[destChainId]?.usdcAddress : undefined;
  const destUsdc = useAppSelector(state =>
    destChainId && destUsdcAddress ?
      selectTokenByAddressOrUndefined(state, destChainId, destUsdcAddress)
    : undefined
  );

  const supported = !!vault && !!destChainId && !!CCTP_CONFIG.chains[destChainId] && !!destUsdc;

  // Preload the source-chain addressbook so source-dust presets can resolve tokens.
  useEffect(() => {
    if (supported && sourceChainId) {
      dispatch(fetchAddressBookAction({ chainId: sourceChainId }));
    }
  }, [dispatch, supported, sourceChainId]);

  const groups = useMemo(() => {
    const byGroup = new Map<string, Scenario[]>();
    for (const s of SCENARIOS) {
      const list = byGroup.get(s.group) ?? [];
      list.push(s);
      byGroup.set(s.group, list);
    }
    return [...byGroup.entries()];
  }, []);

  const run = (scenarioId: string) => {
    const scenario = SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) return;
    // Dispatch a thunk so we build the ctx with a live getState/dispatch.
    dispatch((thunkDispatch, getState) => {
      const state = getState();
      const vId = selectTransactVaultIdOrUndefined(state);
      if (!vId) return;
      const v = selectVaultByIdOrUndefined(state, vId);
      if (!v) return;
      const dest = v.chainId;
      const src = pickSourceChain(dest);
      const usdcAddr = CCTP_CONFIG.chains[dest]?.usdcAddress;
      const usdc = usdcAddr ? selectTokenByAddressOrUndefined(state, dest, usdcAddr) : undefined;
      const depositToken = selectTokenByAddressOrUndefined(state, dest, v.depositTokenAddress);
      if (!usdc || !depositToken) return;
      const ctx: SimCtx = {
        dispatch: thunkDispatch,
        getState,
        vault: v,
        mode: 'deposit',
        sourceChainId: src,
        destChainId: dest,
        destUsdc: usdc,
        vaultDepositToken: depositToken,
        destNativeToken: selectChainNativeToken(state, dest),
        sourceUsdcAddress: CCTP_CONFIG.chains[src]?.usdcAddress ?? usdc.address,
      };
      scenario.apply(ctx);
    });
  };

  if (!open) {
    return (
      <button
        type="button"
        style={{ ...panelStyle, cursor: 'pointer' }}
        onClick={() => setOpen(true)}
      >
        🧪 CC sim
      </button>
    );
  }

  return (
    <div style={panelStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <strong>Cross-chain simulator</strong>
        <button
          type="button"
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
          onClick={() => setOpen(false)}
        >
          ✕
        </button>
      </div>

      {!supported ?
        <div style={{ color: '#ffb86b' }}>
          Open a vault on a CCTP chain (deposit/withdraw form) to enable scenarios.
        </div>
      : <>
          <div style={{ color: '#8a8fb0', marginBottom: '4px' }}>
            {vault?.id} · {sourceChainId} → {destChainId}
          </div>
          <select
            style={{ width: '100%', marginBottom: '6px' }}
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
          >
            {groups.map(([group, items]) => (
              <optgroup key={group} label={group}>
                {items.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              style={{ flex: 1, cursor: 'pointer' }}
              onClick={() => run(selectedId)}
            >
              Apply
            </button>
            <button
              type="button"
              style={{ flex: 1, cursor: 'pointer' }}
              onClick={() => run('reset')}
            >
              Reset
            </button>
          </div>
        </>
      }
    </div>
  );
});
