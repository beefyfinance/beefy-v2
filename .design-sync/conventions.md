# Building with the Beefy design system

Beefy is a **dark-surface** DeFi app. Components assume a dark background and light
text; put them on a light background and several become unreadable.

## Setup — no provider needed

Every component is styled by classes already baked into the shipped CSS. There is no
theme provider to wrap: import the component and render it.

`styles.css` (and its `@import` of `_ds_bundle.css`) sets the app surface on `<body>`:
`background-color: var(--colors-background-body)` and `color: var(--colors-text-middle)`.
Keep that — if you override the page background with a light colour, fix the text colour
too, or the DS's light-on-dark components disappear.

The brand font, **DM Sans**, loads from a `@import url(fonts.googleapis.com…)` at the top
of the stylesheet. Nothing to install.

## Styling idiom — CSS custom properties, not utility classes

Beefy is built with **Panda CSS**. Its class names (`d_flex`, `bg_x`…) are generated at
build time from the app's own source, so you cannot invent new ones — a class you make up
will not exist in the stylesheet.

For your own layout glue, use plain CSS or inline styles, and reach for the DS's custom
properties so your surfaces match the components. Real families in the shipped stylesheet:

| Family | Examples |
|---|---|
| `--colors-*` | `--colors-background-body`, `--colors-background-content`, `--colors-background-content-dark`, `--colors-background-header`, `--colors-text-light`, `--colors-text-middle`, `--colors-text-dark` |
| `--font-sizes-*` | `--font-sizes-h1`, `--font-sizes-h2`, `--font-sizes-h3`, `--font-sizes-body`, `--font-sizes-body-md`, `--font-sizes-body-sm` |
| `--sizes-*`, `--z-*` | layout sizes and z-index scale |

Surfaces, in order from darkest: `background-body` (the page) → `background-content-dark`
→ `background-content` (cards). Text goes `text-light` (emphasis) → `text-middle` (default)
→ `text-dark` (secondary/labels).

**Do not pass the `css` prop.** Several components accept `css?: CssStyles`, but that value
must come from Panda's `css.raw()`, which is not available here. Use the component's own
variant props (`variant`, `size`, `fullWidth`, `borderless`, …) and wrap in your own
styled element when you need spacing.

## Where the truth is

- `_ds_bundle.css` — the entire compiled stylesheet, including every custom property.
  Read it when you need an exact token name.
- `components/<group>/<Name>/<Name>.d.ts` — the component's real prop contract.
- `components/<group>/<Name>/<Name>.prompt.md` — per-component usage notes.

## An idiomatic screen

```jsx
<Section title="Your positions" subTitle="Vaults you currently hold a balance in.">
  <div style={{ display: 'grid', gap: 12 }}>
    <AlertInfo>Harvests run roughly every 4 hours on this chain.</AlertInfo>

    <div style={{
      background: 'var(--colors-background-content)',
      borderRadius: 12,
      padding: 16,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    }}>
      <VaultTag text="CLM" />
      <VaultTag text="Boosted" />
      <span style={{ marginLeft: 'auto', color: 'var(--colors-text-light)' }}>12.42% APY</span>
    </div>

    <div style={{ display: 'flex', gap: 12 }}>
      <Button variant="cta">Deposit</Button>
      <Button variant="transparent">Withdraw</Button>
    </div>
  </div>
</Section>
```

`Button` carries the design language: `variant` is `default | light | filter | cta | boost |
middle | dark | transparent | recovery`, `size` is `xs | sm | md | lg`. Use `cta` for the
primary action on a screen and `transparent` for the secondary.
