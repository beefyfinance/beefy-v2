import { memo, useCallback, useState } from 'react';
import { Button } from '../../../../../../components/Button/Button.tsx';
import { useTranslation } from 'react-i18next';
import { MobileFilters } from './MobileFilters.tsx';
import {
  selectFilterPopinFilterCount,
  selectHasActiveFilter,
} from '../../../../../data/selectors/filtered-vaults.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { styled } from '@repo/styles/jsx';
import ClearIcon from '../../../../../../images/icons/clear.svg?react';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { Count } from '../ClearFiltersButton/ClearFiltersButton.tsx';

export const ExtendedFiltersButtonMobileFilters = memo(
  function ExtendedFiltersButtonMobileFilters() {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useAppDispatch();
    const active = useAppSelector(selectHasActiveFilter);
    const count = useAppSelector(selectFilterPopinFilterCount);

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
              {t('Filter-Btn')}
              {count > 0 && <Count data-count={count} />}
            </FilterButton>
            <FilterButton
              size="sm"
              variant="filter"
              fullWidth={true}
              borderless={true}
              onClick={handleReset}
            >
              <ClearContainer>
                <Clear />
              </ClearContainer>
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

const ClearContainer = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
  },
});

const Clear = styled(ClearIcon, {
  base: {
    width: '16px',
    height: '16px',
  },
});

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
