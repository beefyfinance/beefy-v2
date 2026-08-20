Section from beefy-v2. Use via `window.BeefyV2.Section` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface SectionProps {
  title?: string;
  subTitle?: string;
  children: React.ReactNode;
  maxWidth?: HTMLStyledProps<any>;
  noPadding?: HTMLStyledProps<any>;
}
```

## Examples

### WithTitle

```jsx
() => (
  <Section title="Your positions" subTitle="Vaults you currently hold a balance in.">
    <div style={{ opacity: 0.7 }}>3 vaults · $12,480.22 deposited</div>
  </Section>
)
```

### TitleOnly

```jsx
() => (
  <Section title="Boosted vaults">
    <div style={{ opacity: 0.7 }}>Earn extra rewards on top of the base APY.</div>
  </Section>
)
```

### WithActions

```jsx
() => (
  <Section title="Bridge BIFI" subTitle="Move BIFI between supported chains.">
    <div style={{ display: 'flex', gap: 12 }}>
      <Button variant="cta">Bridge</Button>
      <Button variant="transparent">View history</Button>
    </div>
  </Section>
)
```

## Related

`SectionHeader`
