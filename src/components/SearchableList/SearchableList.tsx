import type { FC } from 'react';
import { memo, useCallback, useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { styles } from './styles';
import { Item } from './Item';
import type { ItemInnerProps } from './ItemInner';
import { ItemInner } from './ItemInner';
import { SearchInput } from '../SearchInput';
import { useTranslation } from 'react-i18next';
import { Scrollable } from '../Scrollable';
import clsx from 'clsx';
import sortBy from 'lodash-es/sortBy';

const useStyles = makeStyles(styles);

export type SearchableListProps = {
  options: string[];
  onSelect: (value: string) => void;
  ItemInnerComponent?: FC<ItemInnerProps>;
  EndComponent?: FC<ItemInnerProps>;
  size?: 'sm' | 'md';
  hideShadows?: boolean;
};

export const SearchableList = memo<SearchableListProps>(function SearchableList({
  options,
  onSelect,
  ItemInnerComponent = ItemInner,
  EndComponent,
  size = 'md',
  hideShadows,
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const filteredOptions = useMemo(() => {
    if (search.length === 0) {
      return options;
    }

    const lowerSearch = search.toLowerCase();
    return options.filter(option => option.toLowerCase().includes(lowerSearch));
  }, [options, search]);

  const handleSelect = useCallback(
    (value: string) => {
      onSelect(value);
    },
    [onSelect]
  );

  return (
    <div className={clsx(classes.searchableList, { [classes.searchableListSM]: size === 'sm' })}>
      <div className={clsx(classes.search, { [classes.searchSM]: size === 'sm' })}>
        <SearchInput value={search} onChange={setSearch} />
      </div>
      <Scrollable hideShadows={hideShadows}>
        <div className={clsx(classes.list, { [classes.listSM]: size === 'sm' })}>
          {filteredOptions.length ? (
            sortBy(filteredOptions, id => id).map(value => (
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
