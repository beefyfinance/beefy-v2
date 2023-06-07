import { InputBase, makeStyles } from '@material-ui/core';
import { Search } from '@material-ui/icons';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Web3 from 'web3';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export const AddressInput = memo(function AddressInput() {
  const [address, setAddress] = useState<string>('');
  const { t } = useTranslation();
  const classes = useStyles();

  const handleChange = useCallback((e: any) => {
    setAddress(e.target.value);
  }, []);

  const isValid = useMemo(() => {
    if (Web3.utils.isAddress(address)) {
      return true;
    } else {
      return false;
    }
  }, [address]);

  return (
    <div>
      <InputBase
        className={classes.search}
        value={address}
        onChange={handleChange}
        fullWidth={true}
        endAdornment={<GoToDashboardButton isValid={isValid} address={address} />}
        placeholder={t('Dashboard-SearchInput-Placeholder')}
      />
    </div>
  );
});

const GoToDashboardButton = memo(function GoToDashboardButton({
  isValid,
  address,
}: {
  isValid: boolean;
  address: string;
}) {
  const classes = useStyles();
  return (
    <Link className={classes.icon} aria-disabled={isValid} to={`/dashboard/${address}`}>
      <Search />
    </Link>
  );
});
