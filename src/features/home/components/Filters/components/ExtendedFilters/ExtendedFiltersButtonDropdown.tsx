import { memo, useCallback, useState } from 'react';
import { ExtendedFilters } from './ExtendedFilters.tsx';
import {
  DropdownInner,
  DropdownOuter,
} from '../../../../../../components/Dropdown/DropdownContent.tsx';
import FilterSvg from '../../../../../../images/icons/filter.svg?react';
import { styled } from '@repo/styles/jsx';
import { selectAnyDesktopExtenderFilterIsActive } from '../../../../../data/selectors/filtered-vaults.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset,
  shift,
  useHover,
  useDismiss,
  useFloating,
  type UseFloatingOptions,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { Button } from '../../../../../../components/Button/Button.tsx';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { FilterContent } from '../../../../../data/reducers/filtered-vaults-types.ts';

export const ExtendedFiltersButtonDropdown = memo(function ExtendedFiltersButtonDropdown() {
  const hasAnyDesktopExtenderFilterActive = useAppSelector(selectAnyDesktopExtenderFilterIsActive);
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const onOpenChange = useCallback<Exclude<UseFloatingOptions['onOpenChange'], undefined>>(
    open => {
      setIsOpen(open);
      if (!open) {
        dispatch(filteredVaultsActions.setFilterContent(FilterContent.Filter));
      }
    },
    [setIsOpen, dispatch]
  );

  const { context, refs, floatingStyles, placement } = useFloating<HTMLButtonElement>({
    placement: 'bottom-end',
    whileElementsMounted(referenceEl, floatingEl, update) {
      return autoUpdate(referenceEl, floatingEl, update, {
        elementResize: false,
      });
    },
    open: isOpen,
    onOpenChange,
    middleware: [
      offset(8),
      // vertical-only flip; a side-axis fallback would detach the panel from the button
      flip({ padding: 12, crossAxis: true }),
      shift({ padding: 12 }),
    ],
  });
  const hover = useHover(context, {
    delay: { open: 100, close: 100 },
    restMs: 100,
  });
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'dialog' });
  const { getFloatingProps, getReferenceProps } = useInteractions([hover, dismiss, role]);

  return (
    <>
      <DropdownButton
        ref={refs.setReference}
        data-active={hasAnyDesktopExtenderFilterActive || undefined}
        variant="filter"
        {...getReferenceProps()}
      >
        <FilterIconContainer>
          <FilterIcon />
        </FilterIconContainer>
      </DropdownButton>
      {isOpen && (
        <FloatingPortal>
          <FiltersDropdownOuter
            ref={refs.setFloating}
            style={floatingStyles}
            data-placement={placement.startsWith('top') ? 'top' : 'bottom'}
            {...getFloatingProps()}
          >
            <FiltersDropdownInner>
              <ExtendedFilters />
            </FiltersDropdownInner>
          </FiltersDropdownOuter>
        </FloatingPortal>
      )}
    </>
  );
});

const DropdownButton = styled(Button, {
  base: {
    paddingBlock: '6px',
    paddingInline: '10px',
  },
});

const FilterIconContainer = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    padding: '2px',
  },
});

const FilterIcon = styled(FilterSvg, {
  base: {
    height: '16px',
    width: '16px',
  },
});

const FiltersDropdownOuter = styled(DropdownOuter, {
  base: {
    // should match height of highest possible content
    height: '390px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    // opened upward: bottom-align so the panel hugs the button instead of leaving a gap
    '&[data-placement="top"]': {
      justifyContent: 'flex-end',
    },
  },
});

const FiltersDropdownInner = styled(
  DropdownInner,
  {
    base: {
      width: '340px',
      // Platforms view is a near-exact 390px fit; keep it from compressing as a flex child
      flexShrink: 0,
    },
  },
  {
    defaultProps: {
      padding: 'none',
    },
  }
);
