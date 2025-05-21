import { memo } from 'react';
import { ExtendedFilters } from './ExtendedFilters.tsx';
import { DropdownProvider } from '../../../../../../components/Dropdown/DropdownProvider.tsx';
import { DropdownButtonTrigger } from '../../../../../../components/Dropdown/DropdownTrigger.tsx';
import { DropdownContent } from '../../../../../../components/Dropdown/DropdownContent.tsx';
import FilterSvg from '../../../../../../images/icons/filter.svg?react';
import { styled } from '@repo/styles/jsx';
import { selectAnyDesktopExtenderFilterIsActive } from '../../../../../data/selectors/filtered-vaults.ts';
import { useAppSelector } from '../../../../../data/store/hooks.ts';

export const ExtendedFiltersButtonDropdown = memo(function ExtendedFiltersButtonDropdown() {
  const hasAnyDesktopExtenderFilterActive = useAppSelector(selectAnyDesktopExtenderFilterIsActive);

  return (
    <DropdownProvider placement="bottom-end">
      <DropdownButton data-active={hasAnyDesktopExtenderFilterActive || undefined} variant="filter">
        <FilterIconContainer>
          <FilterIcon />
        </FilterIconContainer>
      </DropdownButton>
      <FiltersDropdown padding="none">
        <ExtendedFilters />
      </FiltersDropdown>
    </DropdownProvider>
  );
});

const DropdownButton = styled(DropdownButtonTrigger, {
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

const FiltersDropdown = styled(DropdownContent, {
  base: {
    width: '340px',
  },
});
