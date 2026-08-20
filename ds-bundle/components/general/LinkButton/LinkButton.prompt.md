LinkButton from beefy-v2. Use via `window.BeefyV2.LinkButton` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface LinkButtonProps {
  href?: string;
  text?: string;
  type?: string;
  css?: CssStyles;
  hideIconOnMobile?: boolean;
}
```

## Examples

### Link

```jsx
() => (
  <LinkButton type="link" href="https://app.beefy.com/vault/bifi-vault" text="Vault page" />
)
```

### Code

```jsx
() => (
  <LinkButton
    type="code"
    href="https://github.com/beefyfinance/beefy-contracts"
    text="Strategy contract"
  />
)
```

### Group

```jsx
() => (
  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
    <LinkButton type="link" href="https://app.beefy.com" text="Vault page" />
    <LinkButton type="code" href="https://github.com/beefyfinance" text="Strategy" />
    <LinkButton type="link" href="https://docs.beefy.finance" text="Docs" />
  </div>
)
```
