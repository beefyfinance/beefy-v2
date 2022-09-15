import React, { FC, memo, useCallback, useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { styles } from './styles';
import { Item } from './Item';
import { ItemInner, ItemInnerProps } from './ItemInner';
import { SearchInput } from '../SearchInput';
import { useTranslation } from 'react-i18next';
import { Scrollable } from '../Scrollable';

const useStyles = makeStyles(styles);

export type SearchableListProps = {
  options: string[];
  onSelect: (value: string) => void;
  ItemInnerComponent?: FC<ItemInnerProps>;
  EndComponent?: FC<ItemInnerProps>;
};

export const SearchableList = memo<SearchableListProps>(function ({
  options,
  onSelect,
  ItemInnerComponent = ItemInner,
  EndComponent,
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
    <div className={classes.searchableList}>
      <div className={classes.search}>
        <SearchInput value={search} onChange={setSearch} />
      </div>
      <Scrollable>
        <div className={classes.list}>
          {filteredOptions.length ? (
            filteredOptions.map(value => (
              <Item
                key={value}
                value={value}
                onSelect={handleSelect}
                ItemInnerComponent={ItemInnerComponent}
                EndAdornementComponent={EndComponent}
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
