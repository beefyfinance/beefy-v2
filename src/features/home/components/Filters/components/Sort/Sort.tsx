import { memo, useCallback, useState } from 'react';
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
import type {
  AvgApySortType,
  FilteredVaultsState,
} from '../../../../../data/reducers/filtered-vaults-types.ts';

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
  { label: '30d', value: '30' },
  // { label: '90d', value: '90' },
];

// Helper to convert string to number or 'default'
const parseApyValue = (val: string): AvgApySortType => {
  if (val === 'default') return 'default';
  const num = Number(val);
  if (num === 7 || num === 30 || num === 90) return num as AvgApySortType;
  return 'default';
};

export const Sort = memo(function Sort() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  return (
    <>
      <Button variant="filter" size="sm" onClick={handleOpen} fullWidth={true}>
        {t('Filter-Sort-Btn')}
      </Button>
      <Drawer open={isOpen} onClose={handleClose} position="bottom">
        {isOpen && <SortContent onClose={handleClose} />}
      </Drawer>
    </>
  );
});

type SortContentProps = {
  onClose: () => void;
};

const SortContent = memo<SortContentProps>(function SortContent({ onClose }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const sortField = useAppSelector(selectFilterSearchSortField);
  const subSortApy = useAppSelector(selectFilterAvgApySort);
  const [tempSortField, setTempSortField] = useState<SortKey>(
    subSortApy === 'default' ? sortField : 'avgApy'
  );
  const [tempSubSortKey, setTempSubSortKeyState] = useState<AvgApySortType>(subSortApy || 7);

  const setTempSubSortKey = useCallback(
    (val: AvgApySortType) => {
      setTempSubSortKeyState(val);
      if (val === 'default') {
        setTempSortField('apy');
      }
    },
    [setTempSortField]
  );

  const handleSort = useCallback(() => {
    if (tempSortField !== 'avgApy') {
      dispatch(filteredVaultsActions.setSort(tempSortField));
      dispatch(filteredVaultsActions.setSubSort({ column: 'apy', value: 'default' }));
    } else {
      dispatch(filteredVaultsActions.setSubSort({ column: 'apy', value: tempSubSortKey }));
      dispatch(filteredVaultsActions.setSort('apy'));
    }

    onClose();
  }, [dispatch, onClose, tempSortField, tempSubSortKey]);

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

  const handleChange = useCallback(
    (val: SortKey) => {
      if (val === 'avgApy') {
        // If avgApy is already selected, untoggle it and switch to regular apy
        if (tempSubSortKey === 'default') {
          setTempSubSortKey(7);
        } else {
          setTempSubSortKey(tempSubSortKey);
        }
        setTempSortField('avgApy');
      } else {
        setTempSubSortKey('default');
        setTempSortField(val);
      }
    },
    [setTempSubSortKey, tempSubSortKey]
  );

  return (
    <Layout>
      <Main>
        <SortListContainer>
          {COLUMNS.map(({ label, sortKey, toggleButtons }) => (
            <SortItem
              key={sortKey}
              label={label}
              sortKey={sortKey}
              toggleButtons={toggleButtons}
              checked={isChecked(sortKey)}
              onChange={handleChange}
              subValue={tempSubSortKey}
              onSubValueChange={setTempSubSortKey}
            />
          ))}
        </SortListContainer>
      </Main>
      <Footer>
        <Button variant="success" fullWidth={true} borderless={true} onClick={handleSort}>
          {t('Apply')}
        </Button>
      </Footer>
    </Layout>
  );
});

type SortItemProps = {
  sortKey: SortKey;
  toggleButtons?: boolean;
  label: string;
  checked: boolean;
  onChange: (sortKey: SortKey) => void;
  subValue: AvgApySortType;
  onSubValueChange: (value: AvgApySortType) => void;
};

const SortItem = memo(function SortItem({
  sortKey,
  toggleButtons,
  label,
  checked,
  onChange,
  subValue,
  onSubValueChange,
}: SortItemProps) {
  const { t } = useTranslation();

  const handleCheckboxChange = useCallback(
    (_checked: boolean) => {
      onChange(sortKey);
    },
    [onChange, sortKey]
  );

  const handleToggleChange = useCallback(
    (val: string) => {
      const parsedValue = parseApyValue(val);

      if (parsedValue !== 'default') {
        onChange('avgApy');
      }

      onSubValueChange(parsedValue);
    },
    [onChange, onSubValueChange]
  );

  return (
    <SortItemContainer>
      <StyledLabelledCheckBox
        checked={checked}
        onChange={handleCheckboxChange}
        label={t(label)}
        checkVariant="circle"
      />
      {toggleButtons && (
        <ToggleButtons
          value={String(subValue)}
          onChange={handleToggleChange}
          options={OPTIONS}
          variant="filter"
          untoggleValue="default"
        />
      )}
    </SortItemContainer>
  );
});

const SortItemContainer = styled('div', {
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
