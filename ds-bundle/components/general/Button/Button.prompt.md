Button from beefy-v2. Use via `window.BeefyV2.Button` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface ButtonProps {
/** visual style — maps to a colorPalette token set */
variant?: 'default' | 'light' | 'filter' | 'cta' | 'boost' | 'middle' | 'dark' | 'transparent' | 'recovery';
size?: 'xs' | 'sm' | 'md' | 'lg';
/** drop the 2px border (padding compensates) */
borderless?: boolean;
fullWidth?: boolean;
disabled?: boolean;
type?: 'button' | 'submit' | 'reset';
onClick?: React.MouseEventHandler<HTMLButtonElement>;
children?: React.ReactNode;
className?: string;
/** panda style object merged over the recipe */
css?: Record<string, unknown>;
}
```

## Examples

### Variants

```jsx
() => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
    <Button variant="default">Deposit</Button>
    <Button variant="cta">Connect Wallet</Button>
    <Button variant="light">Withdraw</Button>
    <Button variant="filter">All Chains</Button>
    <Button variant="boost">Boost</Button>
    <Button variant="dark">Details</Button>
    <Button variant="transparent">Cancel</Button>
  </div>
)
```

### Sizes

```jsx
() => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
    <Button variant="cta" size="xs">Extra small</Button>
    <Button variant="cta" size="sm">Small</Button>
    <Button variant="cta" size="md">Medium</Button>
    <Button variant="cta" size="lg">Large</Button>
  </div>
)
```

### States

```jsx
() => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
    <Button variant="cta">Enabled</Button>
    <Button variant="cta" disabled>Disabled</Button>
    <Button variant="default" borderless>Borderless</Button>
  </div>
)
```

### FullWidth

```jsx
() => (
  <div style={{ width: 320 }}>
    <Button variant="cta" fullWidth>Deposit 1.42 mooBIFI</Button>
  </div>
)
```

## Related

`ButtonLink`, `ButtonWithTooltip`
