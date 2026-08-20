import { AlertError, AlertInfo, AlertWarning } from 'beefy-v2';

export const Info = () => (
  <AlertInfo>
    Deposits into this vault are paused while the underlying strategy is migrated. Your funds
    remain withdrawable at any time.
  </AlertInfo>
);

export const Warning = () => (
  <AlertWarning>
    This vault holds an experimental asset. Understand the risks before depositing.
  </AlertWarning>
);

export const Error = () => (
  <AlertError>
    The transaction was rejected. Check that your wallet is on the correct network and try again.
  </AlertError>
);

export const Stacked = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560 }}>
    <AlertInfo>Harvests run roughly every 4 hours on this chain.</AlertInfo>
    <AlertWarning>Withdrawing early forfeits the current boost rewards.</AlertWarning>
    <AlertError>Insufficient balance to cover the network fee.</AlertError>
  </div>
);
