IconButtonLink from beefy-v2. Use via `window.BeefyV2.IconButtonLink` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface IconButtonLinkProps {
  href: string;
  text: string;
  Icon: FunctionComponent<SVGProps<SVGSVGElement> & { title?: string; }>;
  css?: CssStyles;
  textCss?: CssStyles;
  iconCss?: CssStyles;
}
```

## Examples

### Default

```jsx
() => (
  <IconButtonLink href="https://github.com/beefyfinance" text="GitHub" Icon={GithubIcon} />
)
```

### Row

```jsx
() => (
  <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
    <IconButtonLink href="https://github.com/beefyfinance" text="GitHub" Icon={GithubIcon} />
    <IconButtonLink href="https://x.com/beefyfinance" text="Twitter" Icon={TwitterIcon} />
  </div>
)
```
