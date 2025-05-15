import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SelectItem, SelectSingleProps } from '../types.ts';
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
  useTypeahead,
} from '@floating-ui/react';
import { SelectDropdown } from '../SelectDropdown.tsx';
import { SelectButton } from '../SelectButton.tsx';
import { SelectLabelPrefix } from '../SelectLabelPrefix.tsx';
import { OptionButton } from '../OptionButton.tsx';
import { indexOrNull } from './helpers.ts';
import { Selected } from './Selected.tsx';
import { Option } from '../Option.tsx';
import { OptionLabel } from '../OptionLabel.tsx';
import { SelectLabel } from '../SelectLabel.tsx';
import { OptionBadge } from '../OptionBadge.tsx';
import { SelectSingleContent } from './SelectSingleContent.tsx';

export const SelectSingle = memo(function SelectSingle<TItem extends SelectItem = SelectItem>({
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
  OptionStartAdornmentComponent = undefined,
  OptionEndAdornmentComponent = undefined,
  OptionBadgeComponent = OptionBadge,
  placement = 'bottom-start',
  layer = 0,
  ...variantProps
}: SelectSingleProps<TItem>) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(() =>
    indexOrNull(options, selected)
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const listRef = useRef<Array<HTMLButtonElement | null>>([]);
  const labelsRef = useRef<Array<string | null>>(options.map(option => option.label));
  const isTypingRef = useRef<boolean>(false);

  const selectedItem = useMemo<TItem | null>(
    () => (selectedIndex !== null && options[selectedIndex]) || null,
    [options, selectedIndex]
  );

  const selectIndex = useCallback(
    (index: number) => {
      setSelectedIndex(index);

      const option = index !== null ? options[index] : undefined;
      if (!option) {
        throw new Error('Selected index out of bounds');
      }
      onChange(option.value);
    },
    [options, setSelectedIndex, onChange]
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

  const handleTypeahead = useCallback(
    (index: number) => {
      if (isOpen) {
        setActiveIndex(index);
      } else {
        selectIndex(index);
      }
    },
    [selectIndex, setActiveIndex, isOpen]
  );

  const listNav = useListNavigation(context, {
    listRef: listRef,
    activeIndex,
    selectedIndex,
    onNavigate: setActiveIndex,
    loop: true,
  });
  const typeahead = useTypeahead(context, {
    listRef: labelsRef,
    activeIndex,
    selectedIndex,
    onMatch: handleTypeahead,
    onTypingChange(isTyping) {
      isTypingRef.current = isTyping;
    },
  });
  const click = useClick(context, { event: 'mousedown' });
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'listbox' });

  const {
    getReferenceProps,
    getFloatingProps,
    getItemProps: getBaseItemProps,
  } = useInteractions([listNav, typeahead, click, dismiss, role]);

  const handleSelect = useCallback(
    (index: number) => {
      selectIndex(index);
      setIsOpen(false);
    },
    [selectIndex, setIsOpen]
  );

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
      return getBaseItemProps({
        active: activeIndex === index,
        selected: selectedIndex === index,
        onClick() {
          // Select by click
          handleSelect(index);
        },
        onKeyDown(event) {
          // Select by Enter key
          if (event.key === 'Enter') {
            event.preventDefault();
            handleSelect(index);
          }
          // Select by Space key
          else if (event.key === ' ' && !isTypingRef.current) {
            event.preventDefault();
            handleSelect(index);
          }
        },
      });
    },
    [getBaseItemProps, selectedIndex, activeIndex, handleSelect]
  );

  useEffect(() => {
    // if parent changes selected out of sync, update selectedIndex to match
    const index = indexOrNull(options, selected);
    if (index !== selectedIndex) {
      setSelectedIndex(index);
    }
  }, [selected, options, selectedIndex, setSelectedIndex]);

  const allSelected = false;
  const noneSelected = selectedIndex === null;

  return (
    <>
      <SelectedComponent
        active={isOpen}
        labelPrefix={labelPrefix}
        item={selectedItem ?? undefined}
        unselectedLabel={unselectedLabel}
        ref={refs.setReference}
        getProps={getReferenceProps}
        ButtonComponent={SelectedButtonComponent}
        LabelPrefixComponent={SelectedLabelPrefixComponent}
        LabelComponent={SelectedLabelComponent}
        {...variantProps}
        borderless={true}
      />
      {isOpen && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <SelectDropdown
              {...getFloatingProps()}
              style={floatingStyles}
              ref={refs.setFloating}
              layer={layer}
            >
              <SelectSingleContent
                options={options}
                selectedIndex={selectedIndex}
                activeIndex={activeIndex}
                allSelected={allSelected}
                noneSelected={noneSelected}
                getItemProps={getItemProps}
                setListRefs={setListRefs}
                OptionComponent={OptionComponent}
                OptionButtonComponent={OptionButtonComponent}
                OptionLabelComponent={OptionLabelComponent}
                OptionBadgeComponent={OptionBadgeComponent}
                OptionStartAdornmentComponent={OptionStartAdornmentComponent}
                OptionEndAdornmentComponent={OptionEndAdornmentComponent}
              />
            </SelectDropdown>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
});
