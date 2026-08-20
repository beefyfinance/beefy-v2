SelectSingle from beefy-v2. Use via `window.BeefyV2.SelectSingle` (bundle loaded from the root `_ds_bundle.js`). Wrap the tree in `<BeefySurface>` (full provider chain in README.md — components read theme/i18n from that context).

## Props

```ts
interface SelectSingleProps {
  className?: string;
  labelPrefix?: string;
  unselectedLabel?: string;
  options: TItem[];
  /** pass a new one of these for logic */
  OptionComponent?: FCWithRef<OptionProps<TItem>, HTMLButtonElement>;
  /** can use styled() on this for css */
  OptionButtonComponent?: FCWithRef<OptionButtonProps, HTMLButtonElement>;
  /** can use styled() on this for css */
  OptionLabelComponent?: FC<OptionLabelProps>;
  /** optional */
  OptionStartAdornmentComponent?: FC<OptionIconProps<TItem>>;
  /** can use styled() on this for css */
  OptionEndAdornmentComponent?: FC<OptionIconProps<TItem>>;
  /** can use styled() on this for css */
  OptionBadgeComponent?: FC<OptionBadgeProps>;
  /** can use styled() on this for css */
  SelectedButtonComponent?: FCWithRef<CommonSelectedButtonProps, HTMLButtonElement>;
  /** can use styled() on this for css */
  SelectedLabelPrefixComponent?: FC<CommonSelectedLabelPrefixProps>;
  /** can use styled() on this for css */
  SelectedLabelComponent?: FC<CommonSelectedLabelProps>;
  /** dropdown position */
  placement?: "top" | "right" | "bottom" | "left" | "top-start" | "top-end" | "right-start" | "right-end" | "bottom-start" | "bottom-end" | "left-start" | "left-end";
  /** z-index layer */
  layer?: 0 | 1 | 2;
  /** enable search */
  searchEnabled?: boolean;
  /** search function */
  searchFunction?: SearchFunction<TItem>;
  /** placeholder */
  placeholder?: string;
  selected: TItem["value"];
  onChange: (value: TItem["value"]) => void;
  /** pass a new one of these for logic */
  SelectedComponent?: FCWithRef<SelectedSingleProps<TItem>, HTMLButtonElement>;
}
```

## Related

`SelectSingleContent`
