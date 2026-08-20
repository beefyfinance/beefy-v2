import { StatusPill } from 'beefy-v2';

export const Ready = () => <StatusPill mode="ready" text="Ready" />;

export const Waiting = () => <StatusPill mode="waiting" text="Waiting" />;

export const Both = () => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
    <StatusPill mode="ready" text="Claimable" />
    <StatusPill mode="waiting" text="Vesting" />
  </div>
);
