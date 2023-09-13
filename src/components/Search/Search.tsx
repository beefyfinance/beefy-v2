import type { ChangeEvent, MouseEventHandler } from 'react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { InputBaseProps } from '@material-ui/core';
import { InputBase, makeStyles } from '@material-ui/core';
import { CloseRounded, Search as SearchIcon } from '@material-ui/icons';
import { styles } from './styles';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

interface SearchProps {
  handleSearchText: (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
  handleClearText: () => void;
  searchText: string;
  autoFocus?: HTMLInputElement['autofocus'];
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  onFocus?: InputBaseProps['onFocus'];
  onBlur?: InputBaseProps['onBlur'];
}

export const Search = memo<SearchProps>(function Search({
  handleSearchText,
  searchText,
  handleClearText,
  autoFocus = false,
  className,
  onClick,
  onFocus,
  onBlur,
}) {
  const { t } = useTranslation();
  const classes = useStyles();

  const valueLength = searchText.length;
  const iconClass = classes.icon;
  const icon = useMemo(() => {
    return valueLength === 0 ? (
      <div className={iconClass}>
        <SearchIcon />
      </div>
    ) : (
      <button onClick={handleClearText} className={iconClass}>
        <CloseRounded />
      </button>
    );
  }, [valueLength, iconClass, handleClearText]);

  return (
    <InputBase
      onFocus={onFocus}
      onBlur={onBlur}
      className={clsx(className, classes.search)}
      value={searchText}
      onChange={handleSearchText}
      fullWidth={true}
      endAdornment={icon}
      autoFocus={autoFocus}
      placeholder={t('Filter-Search')}
      onClick={onClick}
    />
  );
});
