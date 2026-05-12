import CloseRounded from '../../../../images/icons/clear.svg?react';
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
import { styled } from '@repo/styles/jsx';

type AddressInputProps = {
  active?: boolean;
  setActive?: (active: boolean) => void;
  variant?: 'default' | 'transparent';
};

export const AddressInput = memo(function AddressInput({
  variant = 'default',
  active: controlledActive = false,
  setActive: controlledSetActive,
}: AddressInputProps) {
  const [userInput, setUserInput] = useState<string>('');
  const [inputMode, setInputMode] = useState<'address' | 'domain'>('address');
  const resolverStatus = useResolveDomain(inputMode === 'domain' ? userInput : '');
  const [isDomainValid, setIsDomainValid] = useState<boolean>(false);
  const [isDomainResolving, setIsDomainResolving] = useState<boolean>(false);
  const [hasFocus, setHasFocus] = useState<boolean>(false);
  const [localActive, localSetActive] = useState<boolean>(false);
  const isActive = controlledSetActive === undefined ? localActive : controlledActive;
  const setActive = controlledSetActive ?? localSetActive;
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

  const inputLength = userInput.length;
  useEffect(() => {
    setActive(inputLength !== 0 || hasFocus);
  }, [inputLength, hasFocus, setActive]);

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

  return (
    <>
      <BaseInput
        ref={anchorEl}
        variant={variant}
        className={css(
          variant === 'transparent' ? transparentRoot : defaultRoot,
          isActive && (variant === 'transparent' ? transparentRootActive : defaultRootActive)
        )}
        value={userInput}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        fullWidth={true}
        onKeyDown={handleGoToDashboardOnEnterKey}
        startAdornment={
          variant === 'default' ?
            <IconDiv variant={variant} state="disabled">
              <Search />
            </IconDiv>
          : null
        }
        endAdornment={
          <SearchIndicatorButton
            domainResolving={isDomainResolving}
            isValid={isValid}
            userInput={userInput}
            handleClear={handleClear}
            inputMode={inputMode}
            variant={variant}
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

interface SearchIndicatorButtonProps {
  isValid: boolean;
  userInput: string;
  handleClear: () => void;
  domainResolving: boolean;
  inputMode: 'address' | 'domain';
  variant: 'default' | 'transparent';
}

const SearchIndicatorButton = memo(function SearchIndicatorButton({
  isValid,
  userInput,
  handleClear,
  domainResolving,
  inputMode,
  variant,
}: SearchIndicatorButtonProps) {
  const navigate = useNavigate();

  const handleGoToDashboard = useCallback(() => {
    navigate(`/dashboard/${userInput}`);
    handleClear();
  }, [userInput, handleClear, navigate]);

  let children = (
    <IconDiv variant={variant} state="disabled">
      <Search />
    </IconDiv>
  );

  if (domainResolving && inputMode === 'domain') {
    children = (
      <LoaderContainer>
        <CircularProgress size={20} />
      </LoaderContainer>
    );
  } else if (isValid) {
    children = (
      <IconButton state="active" enter={true} onClick={handleGoToDashboard}>
        <EnterIcon />
      </IconButton>
    );
  } else if (userInput.length !== 0) {
    children = (
      <IconButton state="active" onClick={handleClear}>
        <CloseRounded />
      </IconButton>
    );
  } else if (variant === 'default') {
    children = <></>;
  }

  return <SearchIndicatorLayout variant={variant}>{children}</SearchIndicatorLayout>;
});

const SearchIndicatorLayout = styled('div', {
  base: {},
  variants: {
    variant: {
      default: {},
      transparent: {
        marginLeft: '8px',
      },
    },
  },
  defaultVariants: {
    variant: 'transparent',
  },
});

const transparentRoot = css.raw({
  // mobile: collapsed input shows the "Search" placeholder + icon
  width: '79px',
  minWidth: 0,
  transition: 'width 0.2s ease-in-out',
  gap: 0,
  '& .BaseInput-input': {
    fieldSizing: 'content',
    minWidth: 0,
  },
  sm: {
    width: 'auto',
    transition: 'none',
  },
});

const transparentRootActive = css.raw({
  // mobile (active): take the full row available
  width: '100%',
  sm: {
    // tablet+: handled by field-sizing on the input itself
    width: 'auto',
  },
});

const defaultRoot = css.raw({
  transition: 'width 0.2s ease-in-out',
  width: '272px',
});

const defaultRootActive = css.raw({
  width: '100%',
  md: {
    width: '443px',
  },
});
