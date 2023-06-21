import { CircularProgress, InputBase, makeStyles } from '@material-ui/core';
import { CloseRounded, Search } from '@material-ui/icons';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useHistory } from 'react-router-dom';
import { styles } from './styles';
import clsx from 'clsx';
import { getEnsResolver, isValidAddress, isValidEns } from '../../../../helpers/addresses';
import { useAppSelector } from '../../../../store';
import { selectChainById } from '../../../data/selectors/chains';
import { FloatingError } from './FloatingError';

const useStyles = makeStyles(styles);

export const AddressInput = memo(function AddressInput() {
  const [userInput, setUserInput] = useState<string>('');
  const [isENSValid, setIsENSValid] = useState<boolean>(false);
  const [ensLoading, setEnsLoading] = useState<boolean>(false);
  const ethChain = useAppSelector(state => selectChainById(state, 'ethereum'));
  const { t } = useTranslation();
  const classes = useStyles();
  const anchorEl = useRef();
  const history = useHistory();

  useEffect(() => {
    async function fetchValidEns() {
      if (isValidEns(userInput)) {
        const resolvedAddress = await getEnsResolver(userInput, ethChain);
        if (resolvedAddress) {
          setIsENSValid(true);
        } else {
          setIsENSValid(false);
        }
        setEnsLoading(false);
      }
    }
    fetchValidEns();

    return () => {
      setIsENSValid(false);
    };
  }, [userInput, ethChain]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.endsWith('.eth')) {
      setEnsLoading(true);
    }
    setUserInput(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setUserInput('');
  }, []);

  const isAddressValid = useMemo(() => {
    return isValidAddress(userInput);
  }, [userInput]);

  const isValid = useMemo(() => isAddressValid || isENSValid, [isAddressValid, isENSValid]);

  const handleGoToDashboardOnEnterKey = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' && isValid) {
        history.push(`/dashboard/${userInput}`);
        handleClear();
      }
    },
    [userInput, handleClear, history, isValid]
  );

  return (
    <>
      <InputBase
        ref={anchorEl}
        className={clsx(classes.search, { [classes.active]: userInput.length !== 0 })}
        value={userInput}
        onChange={handleChange}
        fullWidth={true}
        onKeyPress={handleGoToDashboardOnEnterKey}
        endAdornment={
          <GoToDashboardButton
            ensLoading={ensLoading}
            isValid={isValid}
            userInput={userInput}
            handleClear={handleClear}
          />
        }
        placeholder={t('Dashboard-SearchInput-Placeholder')}
      />
      <FloatingError
        anchorRef={anchorEl}
        userInput={userInput}
        isAddressValid={isAddressValid}
        isEnsValid={isENSValid}
        ensLoading={ensLoading}
      />
    </>
  );
});

const GoToDashboardButton = memo(function GoToDashboardButton({
  isValid,
  userInput,
  handleClear,
  ensLoading,
}: {
  isValid: boolean;
  userInput: string;
  handleClear: () => void;
  ensLoading: boolean;
}) {
  const classes = useStyles();

  if (ensLoading && userInput.endsWith('.eth'))
    return (
      <div>
        <CircularProgress
          thickness={4}
          size={24}
          className={clsx(classes.icon, classes.disabledIcon)}
        />
      </div>
    );

  if (isValid) {
    return (
      <Link
        onClick={handleClear}
        className={clsx(classes.icon, classes.activeIcon)}
        aria-disabled={isValid}
        to={`/dashboard/${userInput}`}
      >
        <Search />
      </Link>
    );
  }

  if (userInput.length !== 0) {
    return (
      <button onClick={handleClear} className={clsx(classes.icon, classes.activeIcon)}>
        <CloseRounded />
      </button>
    );
  }

  return (
    <div className={clsx(classes.icon, classes.disabledIcon)}>
      <Search />
    </div>
  );
});
