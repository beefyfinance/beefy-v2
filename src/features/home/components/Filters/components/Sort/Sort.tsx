import { memo, useCallback, useState, useEffect } from 'react';
import { Button } from '../../../../../../components/Button/Button.tsx';
import { useTranslation } from 'react-i18next';
import { Drawer } from '../../../../../../components/Modal/Drawer.tsx';
import { styled } from '@repo/styles/jsx';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import {
  selectFilterAvgApySort,
  selectFilterSearchSortField,
} from '../../../../../data/selectors/filtered-vaults.ts';
import { LabelledCheckbox } from '../../../../../../components/LabelledCheckbox/LabelledCheckbox.tsx';
import { ToggleButtons } from '../../../../../../components/ToggleButtons/ToggleButtons.tsx';
import type { FilteredVaultsState } from '../../../../../data/reducers/filtered-vaults-types.ts';

type SortKey = FilteredVaultsState['sort'] | 'avgApy';

const COLUMNS: {
  label: string;
  sortKey: SortKey;
  toggleButtons?: boolean;
}[] = [
  { label: 'Filter-SortDate', sortKey: 'default' },
  { label: 'Filter-SortWallet', sortKey: 'walletValue' },
  { label: 'Filter-SortDeposited', sortKey: 'depositValue' },
  { label: 'Filter-SortApy', sortKey: 'apy' },
  { label: 'Filter-SortAvgApy', sortKey: 'avgApy', toggleButtons: true },
  { label: 'Filter-SortDaily', sortKey: 'daily' },
  { label: 'Filter-SortTvl', sortKey: 'tvl' },
  { label: 'Filter-SortSafety', sortKey: 'safetyScore' },
];

const OPTIONS = [
  { label: '7d', value: '7' },
  // { label: '30d', value: '30' },
  // { label: '90d', value: '90' },
];

export const Sort = memo(function Sort() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const sortField = useAppSelector(selectFilterSearchSortField);
  const subSortApy = useAppSelector(selectFilterAvgApySort);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [tempSortField, setTempSortField] = useState<SortKey>(sortField);
  const [tempSubSortKey, setTempSubSortKey] = useState<'default' | 7 | 30 | 90>(subSortApy || 7);

  // Reset temp states when sortField or subSortApy changes (e.g., when filters are cleared)
  useEffect(() => {
    if (isOpen) {
      // If subSortApy is not 'default', we're in avgApy mode
      if (subSortApy !== 'default') {
        setTempSortField('avgApy');
        setTempSubSortKey(subSortApy);
      } else {
        setTempSortField(sortField);
        setTempSubSortKey('default');
      }
    }
  }, [isOpen, sortField, subSortApy]);

  const handleSort = useCallback(() => {
    if (tempSortField !== 'avgApy') {
      dispatch(filteredVaultsActions.setSort(tempSortField));
      dispatch(filteredVaultsActions.setSubSort({ column: 'apy', value: 'default' }));
    } else {
      dispatch(filteredVaultsActions.setSubSort({ column: 'apy', value: tempSubSortKey }));
      dispatch(filteredVaultsActions.setSort('apy'));
    }

    setIsOpen(false);
  }, [dispatch, tempSortField, tempSubSortKey]);

  const handleOpen = useCallback(() => {
    setIsOpen(open => !open);
  }, []);

  // Helper to convert string to number or 'default'
  const parseApyValue = (val: string): 'default' | 7 | 30 | 90 => {
    if (val === 'default') return 'default';
    const num = Number(val);
    if (num === 7 || num === 30 || num === 90) return num;
    return 'default';
  };

  const handleChange = useCallback(
    (sortKey: SortKey) => (checked: boolean) => {
      if (checked) {
        if (sortKey === 'avgApy') {
          setTempSubSortKey(7);
          setTempSortField('avgApy');
        } else {
          setTempSubSortKey('default');
          setTempSortField(sortKey);
        }
      }
    },
    []
  );

  const isChecked = useCallback(
    (sortKey: SortKey) => {
      if (sortKey === 'avgApy') {
        return tempSubSortKey !== 'default';
      }

      if (sortKey === 'apy') {
        return sortKey === tempSortField && tempSubSortKey === 'default';
      }

      return sortKey === tempSortField;
    },
    [tempSortField, tempSubSortKey]
  );

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleToggleButtons = useCallback((val: string) => {
    setTempSubSortKey(parseApyValue(val));
  }, []);

  return (
    <>
      <Button variant="filter" size="sm" onClick={handleOpen} fullWidth={true}>
        {t('Filter-Sort-Btn')}
      </Button>
      <Drawer open={isOpen} onClose={handleClose} position="bottom">
        <Layout>
          <Main>
            <SortListContainer>
              {COLUMNS.map(({ label, sortKey, toggleButtons }) => (
                <ColumnContainer key={sortKey}>
                  <StyledLabelledCheckBox
                    checked={isChecked(sortKey)}
                    onChange={handleChange(sortKey)}
                    label={t(label)}
                    checkVariant="circle"
                  />
                  {toggleButtons && (
                    <ToggleButtons
                      value={String(tempSubSortKey)}
                      onChange={handleToggleButtons}
                      options={OPTIONS}
                      variant="filter"
                      untoggleValue="default"
                    />
                  )}
                </ColumnContainer>
              ))}
            </SortListContainer>
          </Main>
          <Footer>
            <Button variant="success" fullWidth={true} borderless={true} onClick={handleSort}>
              {t('Apply')}
            </Button>
          </Footer>
        </Layout>
      </Drawer>
    </>
  );
});

const ColumnContainer = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
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
    gap: '24px',
    justifyContent: 'space-between',
    borderRadius: '16px 16px 0px 0px',
  },
});
const Main = styled('div', {
  base: {
    padding: '12px 12px 0px 12px',
  },
});

const Footer = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    padding: '0px 20px 24px 20px',
  },
});
