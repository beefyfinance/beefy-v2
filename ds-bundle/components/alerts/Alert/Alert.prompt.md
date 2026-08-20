Alert from beefy-v2. Use via `window.BeefyV2.Alert` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface AlertProps {
  IconComponent: FC<SVGProps<SVGSVGElement>>;
  children: React.ReactNode;
  variant: any;
  css?: CssStyles;
}
```

## Examples

### Info

```jsx
() => (
  <AlertInfo>
    Deposits into this vault are paused while the underlying strategy is migrated. Your funds
    remain withdrawable at any time.
  </AlertInfo>
)
```

### Warning

```jsx
() => (
  <AlertWarning>
    This vault holds an experimental asset. Understand the risks before depositing.
  </AlertWarning>
)
```

### Error

```jsx
() => (
  <AlertError>
    The transaction was rejected. Check that your wallet is on the correct network and try again.
  </AlertError>
)
```

### Stacked

```jsx
() => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560 }}>
    <AlertInfo>Harvests run roughly every 4 hours on this chain.</AlertInfo>
    <AlertWarning>Withdrawing early forfeits the current boost rewards.</AlertWarning>
    <AlertError>Insufficient balance to cover the network fee.</AlertError>
  </div>
)
```

## Related

`AlertError`, `AlertInfo`, `AlertWarning`
