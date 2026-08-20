import { Button } from 'beefy-v2';

export const Variants = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
    <Button variant="default">Deposit</Button>
    <Button variant="cta">Connect Wallet</Button>
    <Button variant="light">Withdraw</Button>
    <Button variant="filter">All Chains</Button>
    <Button variant="boost">Boost</Button>
    <Button variant="dark">Details</Button>
    <Button variant="transparent">Cancel</Button>
  </div>
);

export const Sizes = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
    <Button variant="cta" size="xs">Extra small</Button>
    <Button variant="cta" size="sm">Small</Button>
    <Button variant="cta" size="md">Medium</Button>
    <Button variant="cta" size="lg">Large</Button>
  </div>
);

export const States = () => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
    <Button variant="cta">Enabled</Button>
    <Button variant="cta" disabled>Disabled</Button>
    <Button variant="default" borderless>Borderless</Button>
  </div>
);

export const FullWidth = () => (
  <div style={{ width: 320 }}>
    <Button variant="cta" fullWidth>Deposit 1.42 mooBIFI</Button>
  </div>
);
