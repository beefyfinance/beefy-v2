import { AlertInfo } from 'beefy-v2';

export const Default = () => (
  <AlertInfo>Harvests run roughly every 4 hours on this chain.</AlertInfo>
);

export const LongCopy = () => (
  <AlertInfo>
    Deposits into this vault are paused while the underlying strategy is migrated. Your funds
    remain withdrawable at any time, and no fees are charged during the migration window.
  </AlertInfo>
);

export const WithLink = () => (
  <AlertInfo>
    This vault was migrated from Beefy V1. <a href="https://beefy.com">Read the migration guide</a>{' '}
    for details.
  </AlertInfo>
);
