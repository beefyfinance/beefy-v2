import { DismissibleBanner } from 'beefy-v2';

export const Info = () => (
  <DismissibleBanner
    id="preview-info"
    variant="info"
    text="Beefy is now live on Sonic — deposit to earn boosted rewards."
  />
);

export const Warning = () => (
  <DismissibleBanner
    id="preview-warning"
    variant="warning"
    text="Scheduled RPC maintenance on Arbitrum between 14:00 and 15:00 UTC."
  />
);
