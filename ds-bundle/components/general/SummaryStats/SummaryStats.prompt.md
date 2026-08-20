SummaryStats from beefy-v2. Use via `window.BeefyV2.SummaryStats` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface SummaryStatsProps {
  items: StatProps[];
}
```

## Examples

### Portfolio

```jsx
() => (
  <SummaryStats
    items={[
      { label: 'Portfolio', value: '$12,480.22' },
      { label: 'Daily yield', value: '$4.18' },
      { label: 'Monthly yield', value: '$126.40' },
      { label: 'Average APY', value: '12.42%' },
    ]}
  />
)
```

### Platform

```jsx
() => (
  <SummaryStats
    items={[
      { label: 'TVL', value: '$284.6M' },
      { label: 'Vaults', value: '742' },
      { label: 'Chains', value: '22' },
      { label: 'Buyback', value: '$1.2M' },
    ]}
  />
)
```
