import React, { memo, useCallback, useMemo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selecTransactForceSelection,
  selectTransactNumTokens,
  selectTransactOptionsMode,
  selectTransactSelected,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact';
import { transactActions } from '../../../../../data/reducers/wallet/transact';
import clsx from 'clsx';
import { ExpandMore } from '@material-ui/icons';
import { TokenImage, TokensImage } from '../../../../../../components/TokenImage/TokenImage';
import { TransactMode, TransactStep } from '../../../../../data/reducers/wallet/transact-types';
import zapIcon from '../../../../../../images/icons/zap.svg';
import { useTranslation } from 'react-i18next';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import type { TokenEntity } from '../../../../../data/entities/token';

const useStyles = makeStyles(styles);

export type TokenSelectButtonProps = {
  index: number;
  className?: string;
};

export const TokenSelectButton = memo<TokenSelectButtonProps>(function TokenSelectButton({
  index,
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
  const mode = useAppSelector(selectTransactOptionsMode);
  const canSwitchToTokenSelect = index === 0 && numTokenOptions > 1;

  const handleClick = useCallback(() => {
    dispatch(transactActions.switchStep(TransactStep.TokenSelect));
  }, [dispatch]);

  const tokenSymbol = useMemo(() => {
    return vault.assetIds.length > 1 &&
      vault.depositTokenAddress === selection.tokens[index].address
      ? 'LP'
      : selection.tokens[index].symbol;
  }, [selection.tokens, vault.assetIds.length, vault.depositTokenAddress, index]);

  const isBreakLp = useMemo(() => {
    return mode === TransactMode.Withdraw && selection.tokens.length > 1;
  }, [mode, selection.tokens.length]);

  const isMultiDeposit = useMemo(() => {
    return mode === TransactMode.Deposit && selection.tokens.length > 1;
  }, [mode, selection.tokens.length]);

  return (
    <button
      onClick={canSwitchToTokenSelect ? handleClick : undefined}
      className={clsx(classes.button, className, { [classes.buttonMore]: canSwitchToTokenSelect })}
    >
      {forceSelection ? (
        <div className={clsx(classes.select, classes.forceSelection)}>
          <div className={classes.zapIcon}>
            <img src={zapIcon} alt="zap" />
          </div>
          {t('Select')}
        </div>
      ) : isBreakLp ? (
        <BreakLp tokens={selection.tokens} />
      ) : (
        <div className={classes.select}>
          <TokensImage
            tokens={isMultiDeposit ? [selection.tokens[index]] : selection.tokens}
            className={classes.iconAssets}
            size={24}
          />
          {tokenSymbol}
        </div>
      )}
      {canSwitchToTokenSelect ? <ExpandMore className={classes.iconMore} /> : null}
    </button>
  );
});

const BreakLp = memo(function BreakLp({ tokens }: { tokens: TokenEntity[] }) {
  const classes = useStyles();
  const token0 = tokens[0];
  const token1 = tokens[1];
  return (
    <div className={classes.breakLp}>
      <TokenImage tokenAddress={token0.address} chainId={token0.chainId} size={16} />
      +
      <TokenImage tokenAddress={token1.address} chainId={token1.chainId} size={16} />
    </div>
  );
});
