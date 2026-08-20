import { SummaryStats } from 'beefy-v2';

export const Portfolio = () => (
  <SummaryStats
    items={[
      { label: 'Portfolio', value: '$12,480.22' },
      { label: 'Daily yield', value: '$4.18' },
      { label: 'Monthly yield', value: '$126.40' },
      { label: 'Average APY', value: '12.42%' },
    ]}
  />
);

export const Platform = () => (
  <SummaryStats
    items={[
      { label: 'TVL', value: '$284.6M' },
      { label: 'Vaults', value: '742' },
      { label: 'Chains', value: '22' },
      { label: 'Buyback', value: '$1.2M' },
    ]}
  />
);
