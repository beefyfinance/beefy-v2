import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { InputBase, makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { selectFilterSearchText } from '../../../../../data/selectors/filtered-vaults';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults';
import { debounce } from 'lodash';
import { useTranslation } from 'react-i18next';
import { CloseRounded, Search } from '@material-ui/icons';

const useStyles = makeStyles(styles);

export const VaultsSearch = memo(function VaultsHeader() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const searchText = useAppSelector(selectFilterSearchText);
  const [value, setValue] = useState(searchText);
  const classes = useStyles();

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

  const valueLength = value.length;
  const iconClass = classes.icon;
  const icon = useMemo(() => {
    return valueLength === 0 ? (
      <div className={iconClass}>
        <Search />
      </div>
    ) : (
      <button onClick={handleClear} className={iconClass}>
        <CloseRounded />
      </button>
    );
  }, [valueLength, handleClear, iconClass]);

  return (
    <InputBase
      className={classes.search}
      value={value}
      onChange={handleChange}
      fullWidth={true}
      endAdornment={icon}
      placeholder={t('Filter-Search')}
    />
  );
});
