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
import { LabelledCheckbox } from '../../../../../../components/LabelledCheckbox/LabelledCheckbox.tsx';

const COLUMNS: {
  label: string;
  sortKey: FilteredVaultsState['sort'];
}[] = [
  { label: 'Filter-SortDate', sortKey: 'default' },
  { label: 'Filter-SortWallet', sortKey: 'walletValue' },
  { label: 'Filter-SortDeposited', sortKey: 'depositValue' },
  { label: 'Filter-SortApy', sortKey: 'apy' },
  { label: 'Filter-SortDaily', sortKey: 'daily' },
  { label: 'Filter-SortTvl', sortKey: 'tvl' },
  { label: 'Filter-SortSafety', sortKey: 'safetyScore' },
];

export const Sort = memo(function Sort() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const sortField = useAppSelector(selectFilterSearchSortField);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [tempSortField, setTempSortField] = useState<FilteredVaultsState['sort']>(sortField);

  const handleSort = useCallback(() => {
    dispatch(filteredVaultsActions.setSort(tempSortField));
    setIsOpen(false);
  }, [dispatch, tempSortField]);

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
                checked={sortKey === tempSortField}
                onChange={() => setTempSortField(sortKey)}
                label={t(label)}
                checkVariant="circle"
              />
            ))}
          </SortListContainer>
          <Button variant="success" fullWidth={true} onClick={handleSort}>
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
    borderRadius: '16px',
    gap: '12px',
    padding: '10px 16px',
  },
});

const Layout = styled('div', {
  base: {
    backgroundColor: 'darkBlue.90',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    padding: '12',
    gap: '32px',
    justifyContent: 'space-between',
    borderRadius: '16px 16px 0px 0px',
  },
});
