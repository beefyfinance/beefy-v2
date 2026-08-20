import { AlertError } from 'beefy-v2';

export const Default = () => (
  <AlertError>Insufficient balance to cover the network fee.</AlertError>
);

export const LongCopy = () => (
  <AlertError>
    The transaction was rejected. Check that your wallet is connected to the correct network and
    that you have approved the token spend, then try again.
  </AlertError>
);
