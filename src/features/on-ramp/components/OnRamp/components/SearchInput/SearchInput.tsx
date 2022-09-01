import React, { memo, useCallback, useMemo } from 'react';
import { InputBase, makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useTranslation } from 'react-i18next';
import { CloseRounded, Search } from '@material-ui/icons';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

export type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};
export const SearchInput = memo<SearchInputProps>(function SearchInput({
  value,
  onChange,
  className,
}) {
  const { t } = useTranslation();
  const classes = useStyles();

  const handleChange = useCallback(
    e => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    onChange('');
  }, [onChange]);

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
      className={clsx(classes.search, className)}
      value={value}
      onChange={handleChange}
      fullWidth={true}
      endAdornment={icon}
      placeholder={t('OnRamp-SearchInput-Placeholder')}
    />
  );
});
