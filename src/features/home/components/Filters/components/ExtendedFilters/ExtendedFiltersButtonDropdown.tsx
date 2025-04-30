import { memo } from 'react';
import { ExtendedFilters } from './ExtendedFilters.tsx';
import { DropdownProvider } from '../../../../../../components/Dropdown/DropdownProvider.tsx';
import { DropdownButtonTrigger } from '../../../../../../components/Dropdown/DropdownTrigger.tsx';
import { DropdownContent } from '../../../../../../components/Dropdown/DropdownContent.tsx';
import FilterSvg from '../../../../../../images/icons/filter.svg?react';
import { styled } from '@repo/styles/jsx';

export const ExtendedFiltersButtonDropdown = memo(function ExtendedFiltersButtonDropdown() {
  return (
    <DropdownProvider placement="bottom-end">
      <DropdownButtonTrigger variant="filter" size="sm">
        <FilterIcon />
      </DropdownButtonTrigger>
      <FiltersDropdown padding="none">
        <ExtendedFilters />
      </FiltersDropdown>
    </DropdownProvider>
  );
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
