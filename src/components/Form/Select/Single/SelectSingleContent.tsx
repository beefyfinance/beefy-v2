import { memo } from 'react';
import type { SelectItem, CommonProps } from '../types.ts';
import { Option } from '../Option.tsx';
import { OptionButton } from '../OptionButton.tsx';
import { OptionLabel } from '../OptionLabel.tsx';
import { OptionBadge } from '../OptionBadge.tsx';
import { OptionIcon } from '../OptionIcon.tsx';

interface SelectSingleContentProps<TItem extends SelectItem = SelectItem>
  extends CommonProps<TItem> {
  options: TItem[];
  selectedIndex: number | null;
  activeIndex: number | null;
  allSelected?: boolean;
  noneSelected: boolean;
  getItemProps: (index: number) => Record<string, unknown>;
  setListRefs: ((el: HTMLButtonElement | null) => void)[];
  disabledIndexes?: number[];
}

export const SelectSingleContent = memo(function SelectSingleContent<
  TItem extends SelectItem = SelectItem,
>({
  options,
  selectedIndex,
  activeIndex,
  allSelected = false,
  noneSelected,
  getItemProps,
  setListRefs,
  disabledIndexes,
  OptionComponent = Option,
  OptionButtonComponent = OptionButton,
  OptionLabelComponent = OptionLabel,
  OptionBadgeComponent = OptionBadge,
  OptionStartAdornmentComponent = OptionIcon,
  OptionEndAdornmentComponent,
}: SelectSingleContentProps<TItem>) {
  return (
    <div>
      {options.map((item, index) =>
        disabledIndexes?.includes(index) ?
          null
        : <OptionComponent
            key={item.value}
            item={item}
            index={index}
            active={activeIndex === index}
            selected={selectedIndex === index}
            allSelected={allSelected}
            noneSelected={noneSelected}
            getProps={getItemProps}
            ref={setListRefs[index]}
            ButtonComponent={OptionButtonComponent}
            LabelComponent={OptionLabelComponent}
            BadgeComponent={OptionBadgeComponent}
            StartAdornmentComponent={OptionStartAdornmentComponent}
            EndAdornmentComponent={OptionEndAdornmentComponent}
          />
      )}
    </div>
  );
});
