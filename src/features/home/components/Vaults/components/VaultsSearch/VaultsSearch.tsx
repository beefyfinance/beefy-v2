import { css } from '@repo/styles/css';
import { useBreakpoint } from '../../../../../../components/MediaQueries/useBreakpoint.ts';
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash-es';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { SearchInput } from '../../../../../../components/Form/Input/SearchInput.tsx';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { selectFilterSearchText } from '../../../../../data/selectors/filtered-vaults.ts';

export const VaultsSearch = memo(function VaultsSearch() {
  const { t } = useTranslation();
  const isDesktop = useBreakpoint({ from: 'lg' });
  const dispatch = useAppDispatch();
  const searchText = useAppSelector(selectFilterSearchText);
  const [value, setValue] = useState(searchText);

  const setFilter = useMemo(
    () => debounce((value: string) => dispatch(filteredVaultsActions.setSearchText(value)), 200),
    [dispatch]
  );

  const handleChange = useCallback(
    (newValue: string) => {
      setValue(newValue);
      setFilter(newValue);
    },
    [setValue, setFilter]
  );

  useEffect(() => {
    // reset local value when filter is reset
    if (searchText === '') {
      setValue('');
    }
  }, [searchText, setValue]);

  return (
    <SearchInput
      placeholder={t('Filter-Vaults-Search-Placeholder')}
      className={input}
      value={value}
      onValueChange={handleChange}
      focusOnSlash={isDesktop}
    />
  );
});

const input = css({
  width: '100%',
  lg: {
    maxWidth: '75%',
  },
});
