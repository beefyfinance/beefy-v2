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
import SearchIcon from '../../../images/icons/mui/Search.svg?react';
import { css, cx } from '@repo/styles/css';
import { BaseInput, type BaseInputProps } from './BaseInput.tsx';
import type { Override } from '../../../features/data/utils/types-utils.ts';
import { useMediaQuery } from '../../MediaQueries/useMediaQuery.ts';

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
  width: '24px',
  height: '24px',
});

const pointerCss = css({
  cursor: 'pointer',
});

const slashCss = css({
  border: `1px solid {colors.text.dark}`,
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '20px',
  height: '20px',
  fontWeight: 'medium',
});

type SearchInputProps = Override<
  Omit<BaseInputProps, 'fullWidth' | 'endAdornment'>,
  {
    onValueChange: (newValue: string) => void;
    value: string;
    minLength?: number;
    placeholder?: string;
    focusOnSlash?: boolean;
  }
>;

const SlashIcon = memo(function SlashIcon() {
  return <div className={slashCss}>{'/'}</div>;
});

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
      return (
        <div className={buttonCss}>
          <SlashIcon />
        </div>
      );
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
      startAdornment={<SearchIcon />}
      endAdornment={endAdornment}
      placeholder={placeholder}
      warning={warning || (minLength > 0 && value.length > 0 && value.length < minLength)}
      {...rest}
    />
  );
});
