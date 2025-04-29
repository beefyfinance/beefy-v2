import { memo, useCallback, useState } from 'react';
import { Button } from '../../../../../../components/Button/Button.tsx';
import { useTranslation } from 'react-i18next';
import { Drawer } from '../../../../../../components/Modal/Drawer.tsx';
import { styled } from '@repo/styles/jsx';
import {
  filteredVaultsActions,
  type FilteredVaultsState,
} from '../../../../../data/reducers/filtered-vaults.ts';
import { useAppDispatch, useAppSelector } from '../../../../../../store.ts';
import { selectFilterSearchSortField } from '../../../../../data/selectors/filtered-vaults.ts';
import { SORT_COLUMNS } from '../../../Vaults/components/VaultsSort/VaultsSort.tsx';
import { LabelledCheckbox } from '../../../../../../components/LabelledCheckbox/LabelledCheckbox.tsx';

const COLUMNS: {
  label: string;
  sortKey: FilteredVaultsState['sort'];
}[] = [{ label: 'Filter-SortDate', sortKey: 'default' }, ...SORT_COLUMNS];

export const Sort = memo(function Sort() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const sortField = useAppSelector(selectFilterSearchSortField);

  const handleSort = useCallback(
    (field: FilteredVaultsState['sort']) => {
      dispatch(filteredVaultsActions.setSort(field));
    },
    [dispatch]
  );

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleOpen = useCallback(() => {
    setIsOpen(open => !open);
  }, []);

  return (
    <>
      <Button variant="filter" size="sm" onClick={handleOpen} fullWidth={true}>
        {t('Filter-Sort-Btn')}
      </Button>
      <Drawer open={isOpen} onClose={() => setIsOpen(false)} position="bottom">
        <Layout>
          <SortListContainer>
            {COLUMNS.map(({ label, sortKey }) => (
              <StyledLabelledCheckBox
                key={sortKey}
                checked={sortKey === sortField}
                onChange={() => handleSort(sortKey)}
                label={t(label)}
                checkVariant="circle"
              />
            ))}
          </SortListContainer>
          <Button variant="success" fullWidth={true} onClick={() => setIsOpen(false)}>
            {t('Apply')}
          </Button>
        </Layout>
      </Drawer>
    </>
  );
});

const StyledLabelledCheckBox = styled(LabelledCheckbox, {
  base: {
    gap: '10px',
  },
});

const SortListContainer = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'background.content.dark',
    borderRadius: '8px',
    gap: '12px',
    padding: '16px',
  },
});

const Layout = styled('div', {
  base: {
    backgroundColor: 'background.header',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    padding: '12px',
    gap: '32px',
    justifyContent: 'space-between',
  },
});
