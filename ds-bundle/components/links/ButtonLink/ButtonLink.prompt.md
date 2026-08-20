ButtonLink from beefy-v2. Use via `window.BeefyV2.ButtonLink` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface ButtonLinkProps {
  onClick: () => void;
  children?: React.ReactNode;
  className?: string;
}
```

## Examples

### Default

```jsx
() => <ButtonLink onClick={noop}>Learn more</ButtonLink>
```

### InSentence

```jsx
() => (
  <div style={{ maxWidth: 480 }}>
    Vault fees changed on 1 August. <ButtonLink onClick={noop}>Review the breakdown</ButtonLink> to
    see what applies to your position.
  </div>
)
```
