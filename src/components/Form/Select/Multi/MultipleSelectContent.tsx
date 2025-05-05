import { memo, useDeferredValue, useMemo, useState } from 'react';
import type { CommonProps, SelectItem, SearchFunction } from '../types.ts';
import { Option } from '../Option.tsx';
import { OptionButton } from '../OptionButton.tsx';
import { OptionLabel } from '../OptionLabel.tsx';
import { OptionIcon } from '../OptionIcon.tsx';
import { OptionBadge } from '../OptionBadge.tsx';
import { SearchField } from './SearchField.tsx';
import { defaultSearchFunction } from './helpers.ts';
import { isDefined } from '../../../../features/data/utils/array-utils.ts';

interface MultipleSelectContentProps<TItem extends SelectItem = SelectItem>
  extends CommonProps<TItem> {
  options: TItem[];
  selected: TItem['value'][];
  activeIndex: number | null;
  allSelected: boolean;
  noneSelected: boolean;
  getItemProps: (index: number) => Record<string, any>;
  setListRefs: ((el: HTMLButtonElement | null) => void)[];
  searchEnabled?: boolean;
  searchFunction?: SearchFunction<TItem>;
}

export const MultipleSelectContent = memo(function MultipleSelectContent<
  TItem extends SelectItem = SelectItem,
>({
  options,
  selected,
  activeIndex,
  allSelected,
  noneSelected,
  getItemProps,
  setListRefs,
  searchEnabled = false,
  searchFunction = defaultSearchFunction,
  OptionComponent = Option,
  OptionButtonComponent = OptionButton,
  OptionLabelComponent = OptionLabel,
  OptionIconComponent = OptionIcon,
  OptionBadgeComponent = OptionBadge,
}: MultipleSelectContentProps<TItem>) {
  const [searchText, setSearchText] = useState<string>('');
  const deferredSearchText = useDeferredValue(searchText);

  const disabledIndexes = useMemo(() => {
    if (!searchEnabled) {
      return undefined;
    }
    if (deferredSearchText.length === 0) {
      return [];
    }
    return options
      .map((option, index) => (searchFunction(option, deferredSearchText) ? undefined : index))
      .filter(isDefined);
  }, [searchEnabled, deferredSearchText, options, searchFunction]);

  const noSearchMatches = searchEnabled && disabledIndexes?.length === options.length;

  return (
    <>
      {searchEnabled && <SearchField value={searchText} onValueChange={setSearchText} />}
      <div>
        {noSearchMatches ?
          <>No matches.</>
        : options.map((item, index) =>
            disabledIndexes?.includes(index) ?
              null
            : <OptionComponent
                key={item.value}
                item={item}
                index={index}
                active={activeIndex === index}
                selected={selected.includes(item.value)}
                allSelected={allSelected}
                noneSelected={noneSelected}
                getProps={getItemProps}
                ref={setListRefs[index]}
                ButtonComponent={OptionButtonComponent}
                LabelComponent={OptionLabelComponent}
                IconComponent={OptionIconComponent}
                BadgeComponent={OptionBadgeComponent}
              />
          )
        }
      </div>
    </>
  );
});
