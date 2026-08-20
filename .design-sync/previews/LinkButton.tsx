import { LinkButton } from 'beefy-v2';

export const Link = () => (
  <LinkButton type="link" href="https://app.beefy.com/vault/bifi-vault" text="Vault page" />
);

export const Code = () => (
  <LinkButton
    type="code"
    href="https://github.com/beefyfinance/beefy-contracts"
    text="Strategy contract"
  />
);

export const Group = () => (
  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
    <LinkButton type="link" href="https://app.beefy.com" text="Vault page" />
    <LinkButton type="code" href="https://github.com/beefyfinance" text="Strategy" />
    <LinkButton type="link" href="https://docs.beefy.finance" text="Docs" />
  </div>
);
