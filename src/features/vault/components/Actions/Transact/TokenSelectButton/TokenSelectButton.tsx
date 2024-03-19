import React, { memo, useCallback, useMemo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selecTransactForceSelection,
  selectTransactNumTokens,
  selectTransactSelected,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact';
import { transactActions } from '../../../../../data/reducers/wallet/transact';
import clsx from 'clsx';
import { ExpandMore } from '@material-ui/icons';
import { TokensImage } from '../../../../../../components/TokenImage/TokenImage';
import { TransactStep } from '../../../../../data/reducers/wallet/transact-types';
import zapIcon from '../../../../../../images/icons/zap.svg';
import { useTranslation } from 'react-i18next';
import { selectVaultById } from '../../../../../data/selectors/vaults';

const useStyles = makeStyles(styles);

export type TokenSelectButtonProps = {
  className?: string;
};

export const TokenSelectButton = memo<TokenSelectButtonProps>(function TokenSelectButton({
  className,
}) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const selection = useAppSelector(selectTransactSelected);
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const numTokenOptions = useAppSelector(selectTransactNumTokens);
  const forceSelection = useAppSelector(selecTransactForceSelection);
  const multipleOptions = numTokenOptions > 1;

  const handleClick = useCallback(() => {
    dispatch(transactActions.switchStep(TransactStep.TokenSelect));
  }, [dispatch]);

  const tokenSymbol = useMemo(() => {
    return vault.depositTokenAddress === selection.tokens[0].address
      ? 'LP'
      : selection.tokens[0].symbol;
  }, [selection.tokens, vault.depositTokenAddress]);

  return (
    <button
      onClick={multipleOptions ? handleClick : undefined}
      className={clsx(classes.button, className, { [classes.buttonMore]: multipleOptions })}
    >
      {forceSelection ? (
        <div className={classes.select}>
          <div className={classes.zapIcon}>
            <img src={zapIcon} alt="zap" />
          </div>
          {t('Select')}
        </div>
      ) : (
        <div className={classes.select}>
          <TokensImage tokens={selection.tokens} className={classes.iconAssets} size={24} />
          {tokenSymbol}
        </div>
      )}
      {multipleOptions ? <ExpandMore className={classes.iconMore} /> : null}
    </button>
  );
});
