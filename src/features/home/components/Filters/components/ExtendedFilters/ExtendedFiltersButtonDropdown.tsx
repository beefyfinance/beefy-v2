import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ExtendedFilters } from './ExtendedFilters.tsx';
import { DropdownProvider } from '../../../../../../components/Dropdown/DropdownProvider.tsx';
import { DropdownButtonTrigger } from '../../../../../../components/Dropdown/DropdownTrigger.tsx';
import { DropdownContent } from '../../../../../../components/Dropdown/DropdownContent.tsx';
import { styled } from '@repo/styles/jsx';

export const ExtendedFiltersButtonDropdown = memo(function ExtendedFiltersButtonDropdown() {
  const { t } = useTranslation();
  return (
    <DropdownProvider variant="dark" placement="bottom-end" arrowEnabled={true}>
      <DropdownButtonTrigger variant="filter" size="sm">
        {t('Filter-Btn')}
      </DropdownButtonTrigger>
      <FiltersDropdown>
        <ExtendedFilters desktopView={true} />
      </FiltersDropdown>
    </DropdownProvider>
  );
});

const FiltersDropdown = styled(DropdownContent, {
  base: {
    width: '360px',
  },
});
