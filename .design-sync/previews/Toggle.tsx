import { Toggle } from 'beefy-v2';

const noop = () => {};

export const Checked = () => <Toggle checked onChange={noop} />;

export const Unchecked = () => <Toggle checked={false} onChange={noop} />;

export const WithLabel = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <Toggle checked onChange={noop} endAdornment={<span>Hide zero balances</span>} />
    <Toggle
      checked={false}
      onChange={noop}
      endAdornment={<span>Show retired vaults</span>}
    />
  </div>
);
