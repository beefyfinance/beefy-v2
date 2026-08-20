import { ActionLink } from 'beefy-v2';

export const Default = () => (
  <ActionLink href="https://app.beefy.com/vault/bifi-vault">↗</ActionLink>
);

export const LinkStyle = () => (
  <ActionLink link href="https://app.beefy.com/buy">Buy BIFI</ActionLink>
);

export const Row = () => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
    <ActionLink href="https://app.beefy.com">↗</ActionLink>
    <ActionLink link href="https://app.beefy.com/buy">Buy BIFI</ActionLink>
  </div>
);
