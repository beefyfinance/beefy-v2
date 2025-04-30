import { memo, useCallback, useState } from 'react';
import { Button } from '../../../../../../components/Button/Button.tsx';
import { useTranslation } from 'react-i18next';
import { MobileFilters } from './MobileFilters.tsx';
import { selectHasActiveFilter } from '../../../../../data/selectors/filtered-vaults.ts';
import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import { PulseHighlight } from '../../../../../vault/components/PulseHighlight/PulseHighlight.tsx';
import { styled } from '@repo/styles/jsx';
import Clear from '../../../../../../images/icons/mui/Clear.svg?react';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';

export const ExtendedFiltersButtonMobileFilters = memo(
  function ExtendedFiltersButtonMobileFilters() {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useAppDispatch();
    const active = useAppSelector(selectHasActiveFilter);

    const handleClose = useCallback(() => {
      setIsOpen(false);
    }, [setIsOpen]);

    const handleOpen = useCallback(() => {
      setIsOpen(true);
    }, [setIsOpen]);

    const handleReset = useCallback(() => {
      dispatch(filteredVaultsActions.reset());
    }, [dispatch]);

    return (
      <>
        {active ?
          <ActiveFilterContainer>
            <FilterButton
              size="sm"
              variant="filter"
              fullWidth={true}
              borderless={true}
              onClick={handleOpen}
            >
              <PulseHighlight variant="success" />
              {t('Filter-Btn')}
            </FilterButton>
            <FilterButton
              size="sm"
              variant="filter"
              fullWidth={true}
              borderless={true}
              onClick={handleReset}
            >
              <Clear />
            </FilterButton>
          </ActiveFilterContainer>
        : <Button size="sm" variant="filter" fullWidth={true} onClick={handleOpen}>
            {t('Filter-Btn')}
          </Button>
        }
        <MobileFilters open={isOpen} onClose={handleClose} />
      </>
    );
  }
);

const ActiveFilterContainer = styled('div', {
  base: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '8px',
    height: '40px',
    border: '2px solid',
    borderColor: 'background.content',
  },
});

const FilterButton = styled(Button, {
  base: {
    gap: '4px',
    _first: {
      width: '70%',
      borderRadius: '6px 0px 0px 6px',
    },
    _last: {
      borderLeft: '2px solid',
      borderColor: 'background.content',
      width: '30%',
      borderRadius: '0px 6px 6px 0px',
    },
  },
});
