import type { ChangeEvent, MouseEventHandler } from 'react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  focusOnSlashPressed?: boolean;
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
  focusOnSlashPressed,
}) {
  const { t } = useTranslation();
  const classes = useStyles();
  const [inputFocused, setInputFocused] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      handleClearText();
    },
    [handleClearText]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      if (onBlur) {
        onBlur(e);
      }
      inputRef.current?.blur();
      setInputFocused(false);
    },
    [onBlur]
  );

  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      if (onFocus) {
        onFocus(e);
      }
      setInputFocused(true);
    },
    [onFocus]
  );

  const valueLength = searchText.length;
  const iconClass = classes.icon;
  const focusIconClass = classes.focusIcon;
  const icon = useMemo(() => {
    return valueLength === 0 ? (
      !inputFocused ? (
        <div className={clsx(focusIconClass, iconClass)}>/</div>
      ) : (
        <div className={iconClass}>
          <SearchIcon />
        </div>
      )
    ) : (
      <button onClick={handleClear} className={iconClass}>
        <CloseRounded />
      </button>
    );
  }, [inputFocused, focusIconClass, iconClass, valueLength, handleClear]);

  useEffect(() => {
    if (focusOnSlashPressed) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === '/') {
          e.preventDefault();
          setInputFocused(true);
          inputRef.current?.focus();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [focusOnSlashPressed]);

  return (
    <InputBase
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={clsx(className, classes.search)}
      value={searchText}
      onChange={handleSearchText}
      fullWidth={true}
      endAdornment={icon}
      autoFocus={autoFocus}
      placeholder={t('Filter-Search')}
      onClick={onClick}
      inputRef={inputRef}
    />
  );
});
