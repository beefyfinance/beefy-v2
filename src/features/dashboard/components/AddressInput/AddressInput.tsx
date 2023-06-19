import { InputBase, makeStyles } from '@material-ui/core';
import { CloseRounded, Search } from '@material-ui/icons';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useHistory } from 'react-router-dom';
import { styles } from './styles';
import clsx from 'clsx';
import { isValidAddress, isValidEns } from '../../../../helpers/addresses';
import { Floating } from '../../../../components/Floating';

const useStyles = makeStyles(styles);

export const AddressInput = memo(function AddressInput({
  viewAsAddress,
}: {
  viewAsAddress: string;
}) {
  const [address, setAddress] = useState<string>('');
  const { t } = useTranslation();
  const classes = useStyles();
  const anchorEl = useRef();

  const history = useHistory();

  const handleChange = useCallback(e => {
    setAddress(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setAddress('');
  }, []);

  const isValid = useMemo(() => {
    //min lenght for ens is 3 chars + 4 by default (.eth)
    if (isValidEns(address) || isValidAddress(address)) {
      return true;
    } else {
      return false;
    }
  }, [address]);

  const addressAlreadyLoaded = useMemo(() => {
    return viewAsAddress === address;
  }, [address, viewAsAddress]);

  const handleGoToDashboardOnEnterKey = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' && isValid) {
        history.push(`/dashboard/${address}`);
        handleClear();
      }
    },
    [address, handleClear, history, isValid]
  );

  return (
    <>
      <InputBase
        ref={anchorEl}
        className={clsx(classes.search, { [classes.active]: address.length !== 0 })}
        value={address}
        onChange={handleChange}
        fullWidth={true}
        onKeyPress={handleGoToDashboardOnEnterKey}
        endAdornment={
          <GoToDashboardButton
            isValid={isValid}
            address={address}
            handleClear={handleClear}
            canClear={addressAlreadyLoaded}
          />
        }
        placeholder={t('Dashboard-SearchInput-Placeholder')}
      />
      <Floating
        open={address.length > 6 && !isValid}
        placement="bottom-start"
        anchorEl={anchorEl}
        className={classes.dropdown}
        display="flex"
        autoWidth={false}
      >
        No Match
      </Floating>
    </>
  );
});

const GoToDashboardButton = memo(function GoToDashboardButton({
  isValid,
  address,
  handleClear,
  canClear,
}: {
  isValid: boolean;
  address: string;
  handleClear: () => void;
  canClear: boolean;
}) {
  const classes = useStyles();

  if (isValid && !canClear) {
    return (
      <Link
        onClick={handleClear}
        className={clsx(classes.icon, classes.activeIcon)}
        aria-disabled={isValid}
        to={`/dashboard/${address}`}
      >
        <Search />
      </Link>
    );
  }

  if (address.length !== 0) {
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
