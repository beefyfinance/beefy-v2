import React, { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectTransactNumTokens,
  selectTransactSelectedTokens,
  selectTransactSelectedTokensId,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { transactActions, TransactStep } from '../../../../../data/reducers/wallet/transact';
import { AssetsImage } from '../../../../../../components/AssetsImage';
import clsx from 'clsx';
import { ExpandMore } from '@material-ui/icons';

const useStyles = makeStyles(styles);

export type TokenSelectButtonProps = {
  className?: string;
};

export const TokenSelectButton = memo<TokenSelectButtonProps>(function ({ className }) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const selectedTokens = useAppSelector(selectTransactSelectedTokens);
  const numTokenOptions = useAppSelector(selectTransactNumTokens);
  const isVaultToken = useMemo(() => {
    return (
      selectedTokens.length === 1 &&
      selectedTokens[0].chainId === vault.chainId &&
      selectedTokens[0].address.toLowerCase() === vault.depositTokenAddress.toLowerCase()
    );
  }, [selectedTokens, vault]);
  const iconAssets = useMemo(
    () => (isVaultToken ? vault.assetIds : selectedTokens.map(token => token.symbol)),
    [isVaultToken, selectedTokens, vault]
  );
  const iconChain = useMemo(
    () => (isVaultToken ? vault.chainId : selectedTokens[0].chainId),
    [isVaultToken, selectedTokens, vault]
  );

  const handleClick = useCallback(() => {
    dispatch(transactActions.switchStep(TransactStep.TokenSelect));
  }, [dispatch]);

  return (
    <button onClick={handleClick} className={clsx(classes.button, className)}>
      <AssetsImage chainId={iconChain} assetIds={iconAssets} className={classes.iconAssets} />
      {numTokenOptions > 1 ? <ExpandMore className={classes.iconMore} /> : null}
    </button>
  );
});
