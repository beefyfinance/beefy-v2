import { css } from '@repo/styles/css';
import { debounce } from 'lodash-es';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchInput } from '../../../../../../components/Form/Input/SearchInput.tsx';
import { useBreakpoint } from '../../../../../../hooks/useBreakpoint.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import {
  selectFilterReseted,
  selectFilterSearchText,
  selectIsSearchTextSettled,
} from '../../../../../data/selectors/filtered-vaults.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { SearchResultCount } from './SearchResultCount.tsx';

export const VaultsSearch = memo(function VaultsSearch() {
  const { t } = useTranslation();
  const isDesktop = useBreakpoint({ from: 'lg' });
  const dispatch = useAppDispatch();
  const searchText = useAppSelector(selectFilterSearchText);
  const reseted = useAppSelector(selectFilterReseted);
  const storeSettled = useAppSelector(selectIsSearchTextSettled);
  const [value, setValue] = useState(searchText);
  const [focused, setFocused] = useState(false);
  // last value THIS component dispatched; anything else in the store came from outside
  const lastDispatched = useRef(searchText);

  const setFilter = useMemo(
    () =>
      debounce((value: string) => {
        lastDispatched.current = value;
        dispatch(filteredVaultsActions.setSearchText(value));
      }, 200),
    [dispatch]
  );

  const handleChange = useCallback(
    (newValue: string) => {
      setValue(newValue);
      setFilter(newValue);
    },
    [setValue, setFilter]
  );
  const handleFocus = useCallback(() => setFocused(true), []);
  const handleBlur = useCallback(() => setFocused(false), []);

  useEffect(() => {
    // adopt the store value on reset/preset (url) or an external setSearchText (e.g. a
    // did-you-mean chip), cancelling any in-flight dispatch so stale typing can't overwrite it
    if (reseted || searchText !== lastDispatched.current) {
      setFilter.cancel();
      setValue(searchText);
      lastDispatched.current = searchText;
    }
  }, [reseted, searchText, setFilter, setValue]);

  useEffect(() => {
    return () => setFilter.cancel();
  }, [setFilter]);

  return (
    <SearchInput
      placeholder={t('Filter-Vaults-Search-PlaceholderExtended')}
      className={input}
      value={value}
      onValueChange={handleChange}
      focusOnSlash={isDesktop}
      onFocus={handleFocus}
      onBlur={handleBlur}
      endAdornment={
        <SearchResultCount
          hasQuery={value.length > 0}
          settled={storeSettled && value === searchText}
          focused={focused}
        />
      }
    />
  );
});

const input = css({
  width: '100%',
  lg: {
    maxWidth: '75%',
  },
});
