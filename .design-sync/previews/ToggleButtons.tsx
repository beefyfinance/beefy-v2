import { ToggleButtons } from 'beefy-v2';

const timeframes = [
  { value: '1D', label: '1D' },
  { value: '1W', label: '1W' },
  { value: '1M', label: '1M' },
  { value: '1Y', label: '1Y' },
  { value: 'all', label: 'ALL' },
];

const noop = () => {};

export const Default = () => (
  <ToggleButtons value="1W" options={timeframes} onChange={noop} />
);

export const Filter = () => (
  <ToggleButtons
    variant="filter"
    value="active"
    options={[
      { value: 'all', label: 'All' },
      { value: 'active', label: 'Active' },
      { value: 'eol', label: 'Retired' },
    ]}
    onChange={noop}
  />
);

export const Card = () => (
  <div style={{ width: 420 }}>
    <ToggleButtons
      variant="card"
      fullWidth
      value="deposit"
      options={[
        { value: 'deposit', label: 'Deposit', subtitle: '12.4% APY' },
        { value: 'withdraw', label: 'Withdraw', subtitle: '1.42 mooBIFI' },
      ]}
      onChange={noop}
    />
  </div>
);

export const Disabled = () => (
  <ToggleButtons disabled value="1D" options={timeframes} onChange={noop} />
);
