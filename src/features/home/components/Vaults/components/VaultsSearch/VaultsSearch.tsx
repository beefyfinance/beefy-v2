import { css } from '@repo/styles/css';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchInput } from '../../../../../../components/Form/Input/SearchInput.tsx';
import { useBreakpoint } from '../../../../../../hooks/useBreakpoint.ts';
import { useDebouncedState } from '../../../../../../hooks/useDebouncedState.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import {
  selectFiltersSettled,
  selectFilterSearchText,
} from '../../../../../data/selectors/filtered-vaults.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { SearchResultCount } from './SearchResultCount.tsx';

export const VaultsSearch = memo(function VaultsSearch() {
  const { t } = useTranslation();
  const isDesktop = useBreakpoint({ from: 'lg' });
  const dispatch = useAppDispatch();
  const storeValue = useAppSelector(selectFilterSearchText);
  const storeSettled = useAppSelector(selectFiltersSettled);
  const [focused, setFocused] = useState(false);

  // Keystrokes drive `value` at input speed; the store write is debounced. useDebouncedState
  // adopts external store changes on its own (reset/preset url, or a did-you-mean chip dispatch).
  const [value, setValue] = useDebouncedState(
    storeValue,
    next => dispatch(filteredVaultsActions.update({ searchText: next })),
    { wait: 200 }
  );

  const handleFocus = useCallback(() => setFocused(true), []);
  const handleBlur = useCallback(() => setFocused(false), []);

  return (
    <SearchInput
      placeholder={t('Filter-Vaults-Search-PlaceholderExtended')}
      className={input}
      value={value}
      onValueChange={setValue}
      focusOnSlash={isDesktop}
      onFocus={handleFocus}
      onBlur={handleBlur}
      endAdornment={
        <SearchResultCount
          hasQuery={value.length > 0}
          settled={storeSettled && value === storeValue}
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
