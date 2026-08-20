import { LabelledCheckbox } from 'beefy-v2';

const noop = () => {};

export const Square = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <LabelledCheckbox checked onChange={noop} label="Boosted vaults" />
    <LabelledCheckbox checked={false} onChange={noop} label="Retired vaults" />
  </div>
);

export const Circle = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <LabelledCheckbox checkVariant="circle" checked onChange={noop} label="Single asset" />
    <LabelledCheckbox
      checkVariant="circle"
      checked={false}
      onChange={noop}
      label="Liquidity pool"
    />
  </div>
);

export const WithAdornment = () => (
  <LabelledCheckbox
    checked
    onChange={noop}
    label="Stablecoins only"
    endAdornment={<span style={{ opacity: 0.6 }}>142</span>}
  />
);
