LinkIcon from beefy-v2. Use via `window.BeefyV2.LinkIcon` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface LinkIconProps {
  logo: string | FC<SVGProps<SVGSVGElement>>;
  alt: string;
  href: string;
}
```

## Examples

### SvgLogo

```jsx
() => (
  <LinkIcon href="https://discord.gg/beefy" alt="Discord" logo={DiscordLogo} />
);

const TelegramLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M21.9 4.3 18.6 20c-.25 1.1-.9 1.37-1.83.85l-5.05-3.72-2.44 2.35c-.27.27-.5.5-1.02.5l.36-5.14L18 6.3c.4-.36-.09-.56-.63-.2L6.4 13.06 1.4 11.5c-1.08-.34-1.1-1.08.23-1.6L20.5 2.62c.9-.33 1.7.22 1.4 1.68z" />
  </svg>
)
```

### Row

```jsx
() => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
    <LinkIcon href="https://discord.gg/beefy" alt="Discord" logo={DiscordLogo} />
    <LinkIcon href="https://t.me/beefyfinance" alt="Telegram" logo={TelegramLogo} />
  </div>
)
```
