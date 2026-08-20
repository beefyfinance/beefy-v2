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

# BeefyV2 (beefy-v2@0.1.0)

This design system is the published beefy-v2 React library, bundled as a single
browser global. All 80 components are the real upstream code.

## Where things are

- `_ds_bundle.js` — the whole-DS bundle at the project root; loads every component to `window.BeefyV2`. First line is a `/* @ds-bundle: … */` metadata header.
- `styles.css` — the single stylesheet entry: it `@import`s the tokens, fonts, and component styles (`_ds_bundle.css`). Link this one file.
- `components/<group>/<Name>/<Name>.prompt.md` (example JSX + variants), `<Name>.d.ts` (types), `<Name>.html` (variant grid).
- `tokens/*.css` — CSS custom properties, names verbatim from upstream.
- `fonts/` — `@font-face` files + `fonts.css` (when the package ships fonts).

For a specific component, `read_file("components/<group>/<Name>/<Name>.prompt.md")`.

## Loading

Add these two lines to your page once (React must be on the page first):

```html
<link rel="stylesheet" href="styles.css">
<script src="_ds_bundle.js"></script>
```

Components are then available at `window.BeefyV2.*`. Mount into a dedicated child node (e.g. `<div id="ds-root">`), not the host page's own React root, so the two trees don't collide:

```jsx
const { ActionButton } = window.BeefyV2;
ReactDOM.createRoot(document.getElementById('ds-root')).render(<ActionButton />);
```

Wrap the tree in the provider — most components read theme/i18n from context:

```jsx
<BeefySurface>{children}</BeefySurface>
```

## Tokens

639 CSS custom properties from beefy-v2. Names are
preserved verbatim from upstream. They are declared inside `_ds_bundle.css` (this DS ships one compiled stylesheet rather than separate token files).

- **color** (533): `--onboard-connect-header-color`, `--onboard-modal-color`, `--onboard-close-button-color`, …
- **spacing** (7): `--tooltip-content-vertical-padding`, `--tooltip-content-horizontal-padding`, `--tooltip-content-vertical-gap`, …
- **typography** (34): `--font-fallback`, `--font-mono-fallback`, `--global-font-body`, …
- **radius** (3): `--onboard-modal-border-radius`, `--onboard-wallet-button-border-radius`, `--tooltip-content-border-radius`
- **other** (62): `--placeholder-fallback`, `--made-with-panda`, `--onboard-modal-z-index`, …

## Components

### prices
- `ActionButton`
- `ActionLink`

### alerts
- `Alert`
- `AlertError`
- `AlertInfo`
- `AlertWarning`

### assetsimage
- `AssetImg`
- `AssetsImageWithChain`
- `SymbolAssetImg`

### general
- `AssetsImage`
- `Button`
- `ChainIcon`
- `CircularProgress`
- `Collapsable`
- `Collapse`
- `Container`
- `ContentLoading`
- `CopyText`
- `Count`
- `IconButtonLink`
- `IconLoader`
- `LabeledStat`
- `LabelledCheckbox`
- `LinkButton`
- `LinkIcon`
- `Marquee`
- `Modal`
- `Notification`
- `PageLayout`
- `PageWithIntroAndContentLayout`
- `ReloadSpinner`
- `Scrollable`
- `ScrollableDrawer`
- `Section`
- `SpinLoader`
- `StatLoader`
- `StatusPill`
- `Step`
- `SummaryStats`
- `TextLoader`
- `Toggle`
- `ToggleButtons`
- `ValueBlock`
- `VaultValueStat`

### tooltip
- `AsTooltip`
- `BasicTooltipContent`
- `ButtonWithTooltip`
- `DivWithTooltip`
- `IconWithBasicTooltip`
- `IconWithTooltip`
- `TooltipContent`
- `TooltipProvider`

### banners
- `Banner`

### input
- `BaseInput`
- `SearchInput`

### links
- `ButtonLink`
- `ExternalLink`

### common
- `Buttons`

### modal
- `Dialog`
- `Drawer`
- `Overlay`

### banner
- `DismissibleBanner`

### dropdown
- `DropdownButtonTrigger`
- `DropdownContent`
- `DropdownTrigger`

### mediaqueries
- `Hidden`
- `Visible`
- `VisibleAbove`

### togglebuttons
- `MultiToggleButton`
- `MultiToggleButtons`
- `ToggleButton`

### badges
- `NotificationDot`

### section
- `SectionHeader`

### select
- `SelectButton`
- `SelectDropdown`

### single
- `SelectSingle`
- `SelectSingleContent`

### vaulttags
- `VaultTag`
- `VaultTagWithTooltip`

### walletcontainer
- `WalletButton`
