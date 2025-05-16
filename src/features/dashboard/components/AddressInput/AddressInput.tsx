import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import CloseRounded from '../../../../images/icons/mui/CloseRounded.svg?react';
import Search from '../../../../images/icons/mui/Search.svg?react';
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
import { Link, useNavigate } from 'react-router';
import { styles } from './styles.ts';
import { css, type CssStyles } from '@repo/styles/css';
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

const useStyles = legacyMakeStyles(styles);

export const AddressInput = memo(function AddressInput({ css: cssProp }: { css?: CssStyles }) {
  const [userInput, setUserInput] = useState<string>('');
  const [inputMode, setInputMode] = useState<'address' | 'domain'>('address');
  const resolverStatus = useResolveDomain(inputMode === 'domain' ? userInput : '');
  const [isDomainValid, setIsDomainValid] = useState<boolean>(false);
  const [isDomainResolving, setIsDomainResolving] = useState<boolean>(false);
  const [hasFocus, setHasFocus] = useState<boolean>(false);
  const { t } = useTranslation();
  const anchorEl = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

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

  return (
    <>
      <BaseInput
        ref={anchorEl}
        className={css(
          styles.search,
          cssProp,
          (userInput.length !== 0 || hasFocus) && styles.active
        )}
        value={userInput}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        fullWidth={true}
        onKeyDown={handleGoToDashboardOnEnterKey}
        startAdornment={
          <GoToDashboardButton
            domainResolving={isDomainResolving}
            isValid={isValid}
            userInput={userInput}
            handleClear={handleClear}
            inputMode={inputMode}
          />
        }
        endAdornment={
          <ClearEnterButton userInput={userInput} handleClear={handleClear} isValid={isValid} />
        }
        placeholder={t('Dashboard-SearchInput-Placeholder')}
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
          anchorRef={anchorEl}
          inputMode={inputMode}
          isAddressValid={isAddressValid}
          isDomainValid={isDomainValid}
          isDomainResolving={isDomainResolving}
        />
      : null}
    </>
  );
});

interface GoToDashboardButtonProps {
  isValid: boolean;
  userInput: string;
  handleClear: () => void;
  domainResolving: boolean;
  inputMode: 'address' | 'domain';
}

const GoToDashboardButton = memo(function GoToDashboardButton({
  isValid,
  userInput,
  handleClear,
  domainResolving,
  inputMode,
}: GoToDashboardButtonProps) {
  const classes = useStyles();

  if (domainResolving && inputMode === 'domain') {
    return (
      <div className={classes.flex}>
        <CircularProgress size={23} className={css(styles.loader, styles.disabledIcon)} />
      </div>
    );
  }

  if (isValid) {
    return (
      <Link
        onClick={handleClear}
        className={css(styles.icon, styles.activeIcon)}
        aria-disabled={isValid}
        to={`/dashboard/${userInput}`}
      >
        <Search />
      </Link>
    );
  }

  return (
    <div className={css(styles.icon, styles.disabledIcon)}>
      <Search />
    </div>
  );
});

const ClearEnterButton = memo(function ClearButton({
  userInput,
  handleClear,
  isValid,
}: {
  userInput: string;
  handleClear: () => void;
  isValid: boolean;
}) {
  const navigate = useNavigate();

  const handleGoToDashboard = useCallback(() => {
    navigate(`/dashboard/${userInput}`);
    handleClear();
  }, [userInput, handleClear, navigate]);

  if (isValid) {
    return (
      <button
        type="button"
        onClick={handleGoToDashboard}
        className={css(styles.icon, styles.enterButton, styles.activeIcon)}
      >
        <EnterIcon />
      </button>
    );
  }

  if (userInput.length !== 0) {
    return (
      <button type="button" onClick={handleClear} className={css(styles.icon, styles.activeIcon)}>
        <CloseRounded />
      </button>
    );
  }

  return null;
});
