# Cross-Chain / CCTP Zap — review kit (Phase 1)

Deliverables for reviewing every cross-chain (CCTP) zap scenario: what the UI shows today vs. what it should show. Import the screenshots + diagram into Figma.

## Contents
- `cross-chain-scenarios.md` — the full scenario catalog (current behavior + copy, gaps, ideal notes, sim preset per row).
- `flow-diagram.mmd` — Mermaid state/UI flow with arrows (render at https://mermaid.live, export SVG/PNG, import to Figma).
- `screenshots/` — one PNG per scenario preset (captured from the simulator).

## The DEV scenario simulator

A dev-only floating panel (`🧪 CC sim`, bottom-right) that seeds Redux to force each Stepper / recovery state **without any wallet, transaction, or CCTP bridge**. It is gated by `import.meta.env.DEV` and stripped from production builds.

Code: `src/components/CrossChainSimulator/` (`CrossChainSimulator.tsx`, `scenarios.ts`, `seed.ts`), mounted in `src/App.tsx` next to `<Tenderly/>`. It relies on one tiny non-DEV addition — the `crossChainSeedRecoveryQuote` action (`actions/wallet/cross-chain.ts`) + its reducer case (`reducers/wallet/transact.ts`) — which is inert in production (never dispatched).

### How to use
1. `npm start` (dev server) and open a vault **on a CCTP chain** (Arbitrum, Base, Ethereum, Optimism, Linea, Polygon, Avalanche, Sonic, Monad, HyperEVM). The vault page must show the deposit/withdraw form (so a vault context is set).
2. Click `🧪 CC sim` (bottom-right) to open the panel. It shows `vaultId · source → dest`.
3. Pick a scenario from the grouped dropdown and click **Apply**. The Stepper modal (or the vault-page recovery UI) jumps to that exact state. **Reset** returns to a clean state.
4. Screenshot. Repeat for each preset.

### Notes / limitations
- **Which vault** changes the look of success screens: single-asset vaults show the deposit-token symbol in the "received" line; LP/CLM vaults show "LP". Open one of each to capture both.
- **Has-gas vs no-gas recovery:** the "no gas" variants are reliable; the "has gas" variants seed a fake native balance that a background balance fetch for the demo wallet may overwrite after a second — if the message flips back to "no gas", click **Apply** again and screenshot promptly.
- **Source-chain dust** needs the source chain's addressbook loaded (the panel preloads it on open); if it renders without the source dust line, wait a moment and re-Apply.
- The simulator never dispatches a real step action (seeded steps are `pending`), and the finalise/switch buttons in the seeded UI have no effect without a real wallet.

### Preset → scenario map
Groups in the dropdown: **Deposit**, **Withdraw**, **Recovery (modal)**, **Recovery (page)**, **Reset**. Each preset id maps to a row in `cross-chain-scenarios.md` (see the `sim` column). Save screenshots as `screenshots/<preset-id>.png`.
