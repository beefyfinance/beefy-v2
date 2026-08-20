import { Banner } from 'beefy-v2';

const noop = () => {};

export const Info = () => (
  <Banner variant="info" text="Beefy is now live on Sonic — deposit to earn boosted rewards." />
);

export const Warning = () => (
  <Banner
    variant="warning"
    text="Scheduled RPC maintenance on Arbitrum between 14:00 and 15:00 UTC."
  />
);

export const Error = () => (
  <Banner variant="error" text="Unable to reach the price feed. Values may be out of date." />
);

export const Dismissible = () => (
  <Banner
    variant="info"
    text="Vault fees changed on 1 August. Review the updated fee breakdown."
    onClose={noop}
  />
);
