import {
  type ChangeEventHandler,
  type FocusEventHandler,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import CloseRounded from '../../../images/icons/mui/CloseRounded.svg?react';
import SearchIcon from '../../../images/icons/search.svg?react';
import { css, cx } from '@repo/styles/css';
import { BaseInput, type BaseInputProps } from './BaseInput.tsx';
import type { Override } from '../../../features/data/utils/types-utils.ts';
import { useMediaQuery } from '../../MediaQueries/useMediaQuery.ts';
import SlashIcon from '../../../images/icons/slash.svg?react';
import { styled } from '@repo/styles/jsx';

const buttonCss = css({
  background: 'transparent',
  padding: '0',
  border: '0',
  boxShadow: 'none',
  lineHeight: 'inherit',
  display: 'flex',
  alignItems: 'center',
  color: 'text.dark',
  flexShrink: '0',
  width: '20px',
  height: '20px',
});

const pointerCss = css({
  cursor: 'pointer',
});

const StartSearchIcon = styled(SearchIcon, {
  base: {
    transform: 'rotate(270deg)',
    color: 'white.70-64a',
  },
});

export type SearchInputProps = Override<
  Omit<BaseInputProps, 'fullWidth' | 'endAdornment'>,
  {
    onValueChange: (newValue: string) => void;
    value: string;
    minLength?: number;
    placeholder?: string;
    focusOnSlash?: boolean;
  }
>;

export const SearchInput = memo(function SearchInput({
  onValueChange,
  value,
  minLength = 0,
  placeholder = 'Search...',
  onChange,
  warning,
  focusOnSlash = false,
  onFocus,
  onBlur,
  ...rest
}: SearchInputProps) {
  const ref = useRef<HTMLInputElement | null>(null);
  const [isFocused, setInputFocused] = useState(false);
  const isTouch = useMediaQuery('(pointer: coarse)');
  const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    e => {
      onChange?.(e);
      onValueChange(e.target.value);
    },
    [onValueChange, onChange]
  );
  const handleClear = useCallback(() => {
    onValueChange('');
  }, [onValueChange]);

  const showClear = value.length > 0;
  const showSlash = focusOnSlash && !isFocused && !isTouch && value.length === 0;
  const endAdornment = useMemo(() => {
    if (showSlash) {
      return <SlashIcon />;
    } else if (showClear) {
      return (
        <button type="button" onClick={handleClear} className={cx(buttonCss, pointerCss)}>
          <CloseRounded />
        </button>
      );
    }
  }, [showClear, showSlash, handleClear]);

  const focusInput = useCallback(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, [ref]);

  const handleFocus = useCallback<FocusEventHandler<HTMLInputElement>>(
    e => {
      onFocus?.(e);
      setInputFocused(true);
    },
    [onFocus, setInputFocused]
  );

  const handleBlur = useCallback<FocusEventHandler<HTMLInputElement>>(
    e => {
      onBlur?.(e);
      setInputFocused(false);
    },
    [onBlur, setInputFocused]
  );

  useEffect(() => {
    if (focusOnSlash && !isTouch) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key !== '/') return; // Exit early if the key is not "/"
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return; // Ignore if typing in an input

        e.preventDefault();
        focusInput();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [focusOnSlash, isTouch, focusInput]);

  return (
    <BaseInput
      inputRef={ref}
      value={value}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      fullWidth={true}
      startAdornment={<StartSearchIcon />}
      endAdornment={endAdornment}
      placeholder={placeholder}
      warning={warning || (minLength > 0 && value.length > 0 && value.length < minLength)}
      {...rest}
    />
  );
});
