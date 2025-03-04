import type { FC } from 'react';
import { memo, useCallback, useMemo, useState } from 'react';
import { styles } from './styles.ts';
import { Item } from './Item.tsx';
import type { ItemInnerProps } from './ItemInner.tsx';
import { ItemInner } from './ItemInner.tsx';
import { useTranslation } from 'react-i18next';
import { Scrollable } from '../Scrollable/Scrollable.tsx';
import { SearchInput } from '../Form/Input/SearchInput.tsx';
import { css } from '@repo/styles/css';

export type SearchableListProps<TValue extends string = string> = {
  options: TValue[];
  onSelect: (value: TValue) => void;
  ItemInnerComponent?: FC<ItemInnerProps<TValue>>;
  EndComponent?: FC<ItemInnerProps<TValue>>;
  size?: 'sm' | 'md';
  hideShadows?: boolean;
};

export const SearchableList = memo(function SearchableList<TValue extends string = string>({
  options,
  onSelect,
  ItemInnerComponent = ItemInner,
  EndComponent,
  size = 'md',
  hideShadows,
}: SearchableListProps<TValue>) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const filteredOptions = useMemo(() => {
    if (search.length === 0) {
      return options;
    }

    const lowerSearch = search.toLowerCase();
    return options.filter(option => option.toLowerCase().includes(lowerSearch)).sort();
  }, [options, search]);

  const handleSelect = useCallback(
    (value: TValue) => {
      onSelect(value);
    },
    [onSelect]
  );

  return (
    <div className={css(styles.searchableList, size === 'sm' && styles.searchableListSM)}>
      <div className={css(styles.search, size === 'sm' && styles.searchSM)}>
        <SearchInput value={search} onValueChange={setSearch} />
      </div>
      <Scrollable hideShadows={hideShadows}>
        <div className={css(styles.list, size === 'sm' && styles.listSM)}>
          {filteredOptions.length ? (
            filteredOptions.map(value => (
              <Item
                key={value}
                value={value}
                onSelect={handleSelect}
                ItemInnerComponent={ItemInnerComponent}
                EndAdornmentComponent={EndComponent}
              />
            ))
          ) : (
            <div>{t('NoMatches')}</div>
          )}
        </div>
      </Scrollable>
    </div>
  );
});
