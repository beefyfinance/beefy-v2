import { AlertWarning } from 'beefy-v2';

export const Default = () => (
  <AlertWarning>Withdrawing early forfeits the current boost rewards.</AlertWarning>
);

export const LongCopy = () => (
  <AlertWarning>
    This vault holds an experimental asset with limited liquidity. Large withdrawals may incur
    significant slippage — understand the risks before depositing.
  </AlertWarning>
);
