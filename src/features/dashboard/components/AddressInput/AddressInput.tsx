import CloseRounded from '../../../../images/icons/mui/CloseRounded.svg?react';
import Search from '../../../../images/icons/search.svg?react';
import {
  type ChangeEvent,
  type KeyboardEvent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { IconButton, IconDiv, LoaderContainer } from './styles.ts';
import { css } from '@repo/styles/css';
import { isMaybeDomain, isValidAddress } from '../../../../helpers/addresses.ts';
import { FloatingError } from './FloatingError/FloatingError.tsx';
import { useResolveDomain } from '../../../data/hooks/resolver.ts';
import {
  isFulfilledStatus,
  isPendingStatus,
  isRejectedStatus,
} from '../../../data/reducers/wallet/resolver-types.ts';
import { BaseInput } from '../../../../components/Form/Input/BaseInput.tsx';
import { CircularProgress } from '../../../../components/CircularProgress/CircularProgress.tsx';
import EnterIcon from '../../../../images/icons/enter.svg?react';
import { useBreakpoint } from '../../../../hooks/useBreakpoint.ts';

type AddressInputProps = {
  variant?: 'default' | 'transparent';
};

export const AddressInput = memo(function AddressInput({ variant = 'default' }: AddressInputProps) {
  const [userInput, setUserInput] = useState<string>('');
  const [inputMode, setInputMode] = useState<'address' | 'domain'>('address');
  const resolverStatus = useResolveDomain(inputMode === 'domain' ? userInput : '');
  const [isDomainValid, setIsDomainValid] = useState<boolean>(false);
  const [isDomainResolving, setIsDomainResolving] = useState<boolean>(false);
  const [hasFocus, setHasFocus] = useState<boolean>(false);
  const { t } = useTranslation();
  const anchorEl = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const isMobile = useBreakpoint({ to: 'xs' });

  const placeholder = useMemo(() => {
    return isMobile ?
        t('Dashboard-SearchInput-Placeholder-Mobile')
      : t('Dashboard-SearchInput-Placeholder');
  }, [isMobile, t]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      if (isMaybeDomain(input)) {
        setInputMode('domain');
      } else {
        setInputMode('address');
      }
      setUserInput(input);
    },
    [setUserInput, setInputMode]
  );

  const handleClear = useCallback(() => {
    setUserInput('');
    setInputMode('address');
  }, []);

  const isAddressValid = useMemo(() => {
    return inputMode === 'address' && isValidAddress(userInput);
  }, [inputMode, userInput]);

  const isValid = useMemo(() => isAddressValid || isDomainValid, [isAddressValid, isDomainValid]);

  const handleGoToDashboardOnEnterKey = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && isValid) {
        navigate(`/dashboard/${userInput}`);
        handleClear();
      }
    },
    [userInput, handleClear, navigate, isValid]
  );

  const handleFocus = useCallback(() => {
    setHasFocus(true);
  }, [setHasFocus]);

  const handleBlur = useCallback(() => {
    setHasFocus(false);
  }, [setHasFocus]);

  useEffect(() => {
    if (isMaybeDomain(userInput)) {
      setInputMode('domain');
    } else {
      setInputMode('address');
    }
  }, [userInput, setInputMode]);

  useEffect(() => {
    if (inputMode === 'domain') {
      if (isFulfilledStatus(resolverStatus)) {
        setIsDomainValid(true);
        setIsDomainResolving(false);
      } else if (isRejectedStatus(resolverStatus)) {
        setIsDomainValid(false);
        setIsDomainResolving(false);
      } else {
        setIsDomainValid(false);
        setIsDomainResolving(true);
      }
    } else {
      setIsDomainValid(false);
      setIsDomainResolving(false);
    }
  }, [inputMode, resolverStatus, setIsDomainValid, setIsDomainResolving]);

  const isActive = userInput.length !== 0 || hasFocus;

  return (
    <>
      <BaseInput
        ref={anchorEl}
        variant={variant}
        data-search-active={isActive ? 'true' : undefined}
        className={css(
          variant === 'transparent' ? transparentBaseWidth : defaultBaseWidth,
          isActive && (variant === 'transparent' ? transparentActiveWidth : defaultActiveWidth)
        )}
        value={userInput}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        fullWidth={true}
        onKeyDown={handleGoToDashboardOnEnterKey}
        endAdornment={
          <EndAdornment
            domainResolving={isDomainResolving}
            isValid={isValid}
            userInput={userInput}
            handleClear={handleClear}
            inputMode={inputMode}
          />
        }
        placeholder={placeholder}
      />
      {(
        hasFocus &&
        !isValid &&
        userInput.length > 0 &&
        !isPendingStatus(resolverStatus) &&
        !isFulfilledStatus(resolverStatus)
      ) ?
        <FloatingError
          userInput={userInput}
          reference={anchorEl}
          inputMode={inputMode}
          isAddressValid={isAddressValid}
          isDomainValid={isDomainValid}
          isDomainResolving={isDomainResolving}
        />
      : null}
    </>
  );
});

interface EndAdornmentProps {
  isValid: boolean;
  userInput: string;
  handleClear: () => void;
  domainResolving: boolean;
  inputMode: 'address' | 'domain';
}

const EndAdornment = memo(function EndAdornment({
  isValid,
  userInput,
  handleClear,
  domainResolving,
  inputMode,
}: EndAdornmentProps) {
  const navigate = useNavigate();

  const handleGoToDashboard = useCallback(() => {
    navigate(`/dashboard/${userInput}`);
    handleClear();
  }, [userInput, handleClear, navigate]);

  if (domainResolving && inputMode === 'domain') {
    return (
      <LoaderContainer>
        <CircularProgress size={20} />
      </LoaderContainer>
    );
  }

  if (isValid) {
    return (
      <IconButton state="active" enter={true} onClick={handleGoToDashboard}>
        <EnterIcon />
      </IconButton>
    );
  }

  if (userInput.length !== 0) {
    return (
      <IconButton state="active" onClick={handleClear}>
        <CloseRounded />
      </IconButton>
    );
  }

  return (
    <IconDiv state="disabled">
      <Search />
    </IconDiv>
  );
});

const transparentBaseWidth = css.raw({
  // mobile: collapsed input shows the "Search" placeholder + icon
  width: '79px',
  minWidth: 0,
  transition: 'width 0.2s ease-in-out',
  sm: {
    // tablet+: input auto-sizes with text content (placeholder when empty).
    width: 'auto',
    transition: 'none',
    '& .BaseInput-input': {
      // input hugs its content — placeholder when empty, typed text when not.
      fieldSizing: 'content',
      minWidth: 0,
      maxWidth: '100%',
      // Fake a thicker caret: hide the native one and paint a 2px green bar
      // at the input's right edge, sized to the font cap-height (visible
      // only while focused, with blink). Safe here because field-sizing
      // keeps the input the exact width of its text, so "right edge of
      // input" == "end of text".
      caretColor: 'transparent',
    },
    '& .BaseInput-input:focus': {
      // 2px-wide vertical bar at the right edge, ~12px tall (font cap
      // height for the 12px label text), vertically centered.
      backgroundImage:
        'linear-gradient(to right, {colors.indicators.success}, {colors.indicators.success})',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '2px 12px',
      backgroundPosition: 'right center',
      paddingRight: '2px',
      animation: 'addressInputCaretBlink 1s steps(1) infinite',
    },
  },
});

const transparentActiveWidth = css.raw({
  // mobile (active): take the full row available
  width: '100%',
  minWidth: 0,
  sm: {
    // tablet+: handled by field-sizing on the input itself
    width: 'auto',
  },
});

const defaultBaseWidth = css.raw({
  transition: 'width 0.2s ease-in-out',
  width: '272px',
});

const defaultActiveWidth = css.raw({
  width: '100%',
  md: {
    width: '443px',
  },
});
