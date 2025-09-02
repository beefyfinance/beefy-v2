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
  SubSortsState,
} from '../../../../../data/reducers/filtered-vaults-types.ts';

type SortKey = FilteredVaultsState['sort'];
type SortKeysWithSubSort = keyof SubSortsState;
type SubSortValuesOf<T extends SortKey> =
  T extends SortKeysWithSubSort ? SubSortsState[T] : 'default';
type SortOptionKey = SortKey | 'avgApy';
type SortOption = {
  label: string;
  optionKey: SortOptionKey;
  subSortOf?: SortKeysWithSubSort;
};
type PendingSort = {
  [K in SortKey]: {
    changed: boolean;
    sort: K;
    subSort: SubSortValuesOf<K>;
  };
}[SortKey];

const SORT_OPTIONS: SortOption[] = [
  { label: 'Filter-SortDate', optionKey: 'default' },
  { label: 'Filter-SortWallet', optionKey: 'walletValue' },
  { label: 'Filter-SortDeposited', optionKey: 'depositValue' },
  { label: 'Filter-SortApy', optionKey: 'apy' },
  { label: 'Filter-SortAvgApy', optionKey: 'avgApy', subSortOf: 'apy' },
  { label: 'Filter-SortDaily', optionKey: 'daily' },
  { label: 'Filter-SortTvl', optionKey: 'tvl' },
  { label: 'Filter-SortSafety', optionKey: 'safetyScore' },
];

const AVG_APY_OPTIONS = [
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
  const [pendingState, setPendingState] = useState<PendingSort>(() =>
    sortField === 'apy' ?
      { changed: false, sort: 'apy', subSort: subSortApy }
    : { changed: false, sort: sortField, subSort: 'default' }
  );
  const selectedOption =
    pendingState.sort === 'apy' && pendingState.subSort !== 'default' ?
      'avgApy'
    : pendingState.sort;

  const handleChange = useCallback(
    <T extends SortKey>(sort: T, subSort?: SubSortValuesOf<T>) => {
      if (sort === 'apy') {
        setPendingState({ changed: true, sort, subSort: subSort || 'default' });
      } else {
        setPendingState({ changed: true, sort, subSort: 'default' });
      }
    },
    [setPendingState]
  );

  const handleApply = useCallback(() => {
    if (pendingState.changed) {
      dispatch(filteredVaultsActions.setSort(pendingState.sort));
      if (pendingState.sort === 'apy') {
        dispatch(
          filteredVaultsActions.setSubSort({
            column: pendingState.sort,
            value: pendingState.subSort || 'default',
          })
        );
      }
    }

    onClose();
  }, [dispatch, onClose, pendingState]);

  return (
    <Layout>
      <Main>
        <SortListContainer>
          {SORT_OPTIONS.map(({ label, optionKey, subSortOf }) => (
            <SortItem
              key={optionKey}
              label={label}
              optionKey={optionKey}
              subSortOf={subSortOf}
              checked={selectedOption === optionKey}
              onChange={handleChange}
              subValue={pendingState.subSort}
            />
          ))}
        </SortListContainer>
      </Main>
      <Footer>
        <Button variant="cta" fullWidth={true} borderless={true} onClick={handleApply}>
          {t('Apply')}
        </Button>
      </Footer>
    </Layout>
  );
});

type SortItemProps = SortOption & {
  checked: boolean;
  onChange: <T extends SortKey>(sort: T, subSort?: SubSortValuesOf<T>) => void;
  subValue: AvgApySortType;
};

const SortItem = memo(function SortItem({
  optionKey,
  subSortOf,
  label,
  checked,
  onChange,
  subValue,
}: SortItemProps) {
  const { t } = useTranslation();

  const handleCheckboxChange = useCallback(
    (_checked: boolean) => {
      if (optionKey === 'avgApy') {
        onChange('apy', 7); // default to 7d when selecting avgApy
      } else {
        onChange(optionKey);
      }
    },
    [onChange, optionKey]
  );

  const handleToggleChange = useCallback(
    (val: string) => {
      if (optionKey === 'avgApy') {
        const parsedValue = parseApyValue(val);
        onChange('apy', parsedValue);
      } else {
        throw new Error(`Not expecting toggle change for optionKey: ${optionKey}`);
      }
    },
    [onChange, optionKey]
  );

  return (
    <SortItemContainer>
      <StyledLabelledCheckBox
        checked={checked}
        onChange={handleCheckboxChange}
        label={t(label)}
        checkVariant="circle"
      />
      {subSortOf && (
        <ToggleButtons
          value={String(subValue)}
          onChange={handleToggleChange}
          options={AVG_APY_OPTIONS}
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
