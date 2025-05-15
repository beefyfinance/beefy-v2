import type { FC } from 'react';
import { memo, useCallback, useMemo, useState } from 'react';
import { Item, type ItemInnerProps } from './Item.tsx';
import { useTranslation } from 'react-i18next';
import { Scrollable } from '../Scrollable/Scrollable.tsx';
import { SearchInput } from '../Form/Input/SearchInput.tsx';
import { css, cx } from '@repo/styles/css';

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
  ItemInnerComponent,
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
    <div className={cx(containerClass, size === 'sm' && smallClass)}>
      <div className={searchbarClass}>
        <SearchInput value={search} onValueChange={setSearch} />
      </div>
      <Scrollable hideShadows={hideShadows}>
        <div className={listClass}>
          {filteredOptions.length ?
            filteredOptions.map(value => (
              <Item
                key={value}
                value={value}
                onSelect={handleSelect}
                ItemInnerComponent={ItemInnerComponent}
                EndAdornmentComponent={EndComponent}
              />
            ))
          : <div className={noMatchesClass}>{t('NoMatches')}</div>}
        </div>
      </Scrollable>
    </div>
  );
});

const containerClass = css({
  '--searchable-list-padding-size': '24px',
  '--searchable-list-form-gap': '24px',
  '--searchable-list-item-gap': '16px',
  display: 'grid',
  gridTemplateColumns: 'minmax(0,1fr)',
  gridTemplateRows: 'auto minmax(0,1fr)',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  rowGap: 'var(--searchable-list-form-gap)',
  padding: 'var(--searchable-list-padding-size) 0 0 0',
});

const searchbarClass = css({ padding: '0 var(--searchable-list-padding-size)' });

const listClass = css({
  minHeight: '100px',
  display: 'flex',
  flexDirection: 'column',
  rowGap: 'var(--searchable-list-item-gap)',
  overflowY: 'auto',
  overflowX: 'hidden',
  padding: '0 0 var(--searchable-list-padding-size) 0',
});

const noMatchesClass = css({
  padding:
    '0 var(--searchable-list-padding-size) var(--searchable-list-padding-size) var(--searchable-list-padding-size)',
});

const smallClass = css({
  '--searchable-list-padding-size': '12px',
  '--searchable-list-form-gap': '16px',
  '--searchable-list-item-gap': '12px',
});
