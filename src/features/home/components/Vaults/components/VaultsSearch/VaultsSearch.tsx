import { css } from '@repo/styles/css';
import { useBreakpoint } from '../../../../../../hooks/useBreakpoint.ts';
import { useDebouncedState } from '../../../../../../hooks/useDebouncedState.ts';
import { useTranslation } from 'react-i18next';
import { memo } from 'react';
import { SearchInput } from '../../../../../../components/Form/Input/SearchInput.tsx';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { selectFilterSearchText } from '../../../../../data/selectors/filtered-vaults.ts';

export const VaultsSearch = memo(function VaultsSearch() {
  const { t } = useTranslation();
  const isDesktop = useBreakpoint({ from: 'lg' });
  const dispatch = useAppDispatch();
  const storeValue = useAppSelector(selectFilterSearchText);

  // Keystrokes drive `value` at input speed; the store write is debounced.
  const [value, setValue] = useDebouncedState(
    storeValue,
    next => dispatch(filteredVaultsActions.update({ searchText: next })),
    { wait: 200 }
  );

  return (
    <SearchInput
      placeholder={t('Filter-Vaults-Search-Placeholder')}
      className={input}
      value={value}
      onValueChange={setValue}
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
