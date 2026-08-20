import { BaseInput } from 'beefy-v2';

const noop = () => {};

export const Default = () => (
  <div style={{ width: 320 }}>
    <BaseInput placeholder="0.00" value="1.42" onChange={noop} />
  </div>
);

export const Placeholder = () => (
  <div style={{ width: 320 }}>
    <BaseInput placeholder="Search vaults" value="" onChange={noop} />
  </div>
);

export const Adornments = () => (
  <div style={{ width: 320 }}>
    <BaseInput
      value="1.42"
      onChange={noop}
      startAdornment={<span>BIFI</span>}
      endAdornment={<span style={{ opacity: 0.6 }}>MAX</span>}
    />
  </div>
);

export const Disabled = () => (
  <div style={{ width: 320 }}>
    <BaseInput disabled value="0.00" onChange={noop} />
  </div>
);
