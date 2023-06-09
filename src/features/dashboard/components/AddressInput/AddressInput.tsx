import { InputBase, makeStyles } from '@material-ui/core';
import { CloseRounded, Search } from '@material-ui/icons';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useHistory } from 'react-router-dom';
import Web3 from 'web3';
import { styles } from './styles';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

export const AddressInput = memo(function AddressInput({
  viewAsAddress,
}: {
  viewAsAddress: string;
}) {
  const [address, setAddress] = useState<string>('');
  const { t } = useTranslation();
  const classes = useStyles();

  const history = useHistory();

  const handleChange = useCallback(e => {
    setAddress(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setAddress('');
  }, []);

  const isValid = useMemo(() => {
    if (Web3.utils.isAddress(address)) {
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
      }
    },
    [address, history, isValid]
  );

  return (
    <InputBase
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
