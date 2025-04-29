import { memo, useCallback, useState } from 'react';
import { Button } from '../../../../../../components/Button/Button.tsx';
import { useTranslation } from 'react-i18next';
import { MobileFilters } from './MobileFilters.tsx';
import { selectHasActiveFilter } from '../../../../../data/selectors/filtered-vaults.ts';
import { useAppSelector } from '../../../../../../store.ts';
import { PulseHighlight } from '../../../../../vault/components/PulseHighlight/PulseHighlight.tsx';
import { styled } from '@repo/styles/jsx';

export const ExtendedFiltersButtonMobileFilters = memo(
  function ExtendedFiltersButtonMobileFilters() {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const active = useAppSelector(selectHasActiveFilter);

    const handleClose = useCallback(() => {
      setIsOpen(false);
    }, [setIsOpen]);

    const handleOpen = useCallback(() => {
      setIsOpen(true);
    }, [setIsOpen]);

    return (
      <>
        <FilterButton size="sm" variant="filter" fullWidth={true} onClick={handleOpen}>
          {active ?
            <PulseHighlight variant="success" />
          : null}
          {t('Filter-Btn')}
        </FilterButton>
        <MobileFilters open={isOpen} onClose={handleClose} />
      </>
    );
  }
);

const FilterButton = styled(Button, {
  base: {
    gap: '4px',
  },
});
