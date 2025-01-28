import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { selectFilterSearchText } from '../../../../../data/selectors/filtered-vaults';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults';
import { debounce } from 'lodash-es';
import { Search } from '../../../../../../components/Search';
import { useMediaQuery } from '@material-ui/core';

export const VaultsSearch = memo(function VaultsHeader({ className }: { className?: string }) {
  const dispatch = useAppDispatch();
  const searchText = useAppSelector(selectFilterSearchText);
  const [value, setValue] = useState(searchText);

  const isDesktop = useMediaQuery('(min-width: 960px)', { noSsr: true });

  const setFilter = useMemo(
    () => debounce(value => dispatch(filteredVaultsActions.setSearchText(value)), 200),
    [dispatch]
  );

  const handleChange = useCallback(
    e => {
      setValue(e.target.value);
      setFilter(e.target.value);
    },
    [setValue, setFilter]
  );

  const handleClear = useCallback(() => {
    setValue('');
    dispatch(filteredVaultsActions.setSearchText(''));
  }, [setValue, dispatch]);

  useEffect(() => {
    // reset local value when filter is reset
    if (searchText === '') {
      setValue('');
    }
  }, [searchText, setValue]);

  return (
    <Search
      className={className}
      searchText={value}
      handleClearText={handleClear}
      handleSearchText={handleChange}
      focusOnSlashPressed={isDesktop}
    />
  );
});
