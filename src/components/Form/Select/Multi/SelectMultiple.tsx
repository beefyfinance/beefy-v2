import { memo, useCallback, useDeferredValue, useMemo, useRef, useState } from 'react';
import type { SelectItem, SelectMultiProps } from '../types.ts';
import {
  autoUpdate,
  flip as flipMiddleware,
  FloatingFocusManager,
  FloatingPortal,
  size as sizeMiddleware,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole,
} from '@floating-ui/react';
import { SelectDropdown } from '../SelectDropdown.tsx';
import { SelectButton } from '../SelectButton.tsx';
import { SelectLabelPrefix } from '../SelectLabelPrefix.tsx';
import { OptionButton } from '../OptionButton.tsx';
import { Selected } from './Selected.tsx';
import { Option } from '../Option.tsx';
import { isDefined } from '../../../../features/data/utils/array-utils.ts';
import { SelectLabel } from '../SelectLabel.tsx';
import { OptionLabel } from '../OptionLabel.tsx';
import { SearchInput } from '../../Input/SearchInput.tsx';
import { OptionBadge } from '../OptionBadge.tsx';
import { OptionIcon } from '../OptionIcon.tsx';
import { useMediaQuery } from '../../../MediaQueries/useMediaQuery.ts';

function indexesFromValues<TItem extends SelectItem>(
  options: TItem[],
  selected: TItem['value'][]
): number[] {
  return mutateSortIndexes(
    selected.map(value => options.findIndex(o => o.value === value)).filter(index => index >= 0)
  );
}

function mutateSortIndexes(indexes: number[]): number[] {
  return indexes.sort((a, b) => a - b);
}

function defaultSearchFunction<TItem extends SelectItem>(item: TItem, query: string): boolean {
  return item.label.toLowerCase().includes(query.toLowerCase());
}

export const SelectMultiple = memo(function Select<TItem extends SelectItem = SelectItem>({
  selected,
  options,
  onChange,
  labelPrefix,
  unselectedLabel = 'All',
  SelectedComponent = Selected,
  SelectedButtonComponent = SelectButton,
  SelectedLabelComponent = SelectLabel,
  SelectedLabelPrefixComponent = SelectLabelPrefix,
  OptionComponent = Option,
  OptionButtonComponent = OptionButton,
  OptionLabelComponent = OptionLabel,
  OptionIconComponent = OptionIcon,
  OptionBadgeComponent = OptionBadge,
  placement = 'bottom-start',
  layer = 0,
  searchEnabled = false,
  searchFunction = defaultSearchFunction,
  allSelectedLabel = 'All',
  ...variantProps
}: SelectMultiProps<TItem>) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const listRef = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndexes = useMemo(() => indexesFromValues(options, selected), [options, selected]);
  const selectedItems = useMemo<TItem[]>(
    () => selectedIndexes.map(index => options[index]).filter(isDefined),
    [options, selectedIndexes]
  );
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
  const isTouch = useMediaQuery('(pointer: coarse)');

  const handleSelect = useCallback(
    (index: number | null) => {
      const option = index !== null ? options[index] : undefined;
      let newSelected: TItem['value'][];

      if (!option || index === null) {
        // null -> unselect all
        newSelected = [];
      } else {
        const prevSelected = selected.includes(option.value);

        if (prevSelected) {
          // removing from list
          newSelected = selected.filter(i => i !== option.value);
        } else if (selected.length === 0) {
          // adding to empty list
          newSelected = [option.value];
        } else {
          // adding to list
          newSelected = [...selected, option.value];
        }
      }

      onChange(newSelected);
    },
    [options, selected, onChange]
  );

  const { refs, floatingStyles, context } = useFloating<HTMLButtonElement>({
    placement,
    open: isOpen,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      flipMiddleware(),
      sizeMiddleware({
        padding: 16,
        apply({ availableWidth, availableHeight, elements }) {
          elements.floating.style.width = elements.reference.getBoundingClientRect().width + 'px';
          elements.floating.style.maxWidth = availableWidth + 'px';
          elements.floating.style.maxHeight = availableHeight + 'px';
        },
      }),
    ],
  });

  const listNav = useListNavigation(context, {
    listRef: listRef,
    activeIndex,
    selectedIndex: selectedIndexes.length ? selectedIndexes[0] : null,
    onNavigate: setActiveIndex,
    loop: true,
    virtual: searchEnabled && !isTouch,
    disabledIndices: disabledIndexes,
  });
  const click = useClick(context, { event: 'mousedown' });
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: searchEnabled ? 'combobox' : 'select' });

  const {
    getReferenceProps,
    getFloatingProps,
    getItemProps: getBaseItemProps,
  } = useInteractions([listNav, click, dismiss, role]);

  const numOptions = options.length;
  const setListRefs = useMemo(
    () =>
      Array.from({ length: numOptions }, (_, index) => (el: HTMLButtonElement | null) => {
        listRef.current[index] = el;
      }),
    [numOptions, listRef]
  );

  const getItemProps = useCallback(
    (index: number) => {
      const active = activeIndex === index;
      const selected = selectedIndexes.includes(index);

      return getBaseItemProps({
        active,
        selected,
        onClick() {
          // Select by click
          handleSelect(index);
        },
        onKeyDown(event) {
          // Select by Enter/Space key
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleSelect(index);
          }
        },
      });
    },
    [getBaseItemProps, selectedIndexes, activeIndex, handleSelect]
  );

  const allSelected = selected.length === options.length;
  const noneSelected = selected.length === 0;
  const noSearchMatches = searchEnabled && disabledIndexes?.length === options.length;

  return (
    <>
      <SelectedComponent
        active={isOpen}
        labelPrefix={labelPrefix}
        items={selectedItems}
        allSelected={allSelected}
        unselectedLabel={unselectedLabel}
        allSelectedLabel={allSelectedLabel}
        ref={refs.setReference}
        getProps={getReferenceProps}
        ButtonComponent={SelectedButtonComponent}
        LabelComponent={SelectedLabelComponent}
        LabelPrefixComponent={SelectedLabelPrefixComponent}
        {...variantProps}
      />
      {isOpen && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <SelectDropdown
              {...getFloatingProps()}
              style={floatingStyles}
              ref={refs.setFloating}
              layer={layer}
              header={
                searchEnabled && <SearchInput value={searchText} onValueChange={setSearchText} />
              }
            >
              {noSearchMatches ? (
                <>no matches</>
              ) : (
                options.map((item, index) =>
                  disabledIndexes?.includes(index) ? null : (
                    <OptionComponent
                      key={item.value}
                      item={item}
                      index={index}
                      active={activeIndex === index}
                      selected={selected.includes(item.value)}
                      getProps={getItemProps}
                      ref={setListRefs[index]}
                      allSelected={allSelected}
                      noneSelected={noneSelected}
                      ButtonComponent={OptionButtonComponent}
                      LabelComponent={OptionLabelComponent}
                      IconComponent={OptionIconComponent}
                      BadgeComponent={OptionBadgeComponent}
                    />
                  )
                )
              )}
            </SelectDropdown>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
});
