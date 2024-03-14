import React, { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectTransactNumTokens,
  selectTransactSelected,
} from '../../../../../data/selectors/transact';
import { transactActions } from '../../../../../data/reducers/wallet/transact';
import clsx from 'clsx';
import { ExpandMore } from '@material-ui/icons';
import { TokensImage } from '../../../../../../components/TokenImage/TokenImage';
import { TransactStep } from '../../../../../data/reducers/wallet/transact-types';
import type { TokenEntity } from '../../../../../data/entities/token';

const useStyles = makeStyles(styles);

export type TokenSelectButtonProps = {
  className?: string;
};

export const TokenSelectButton = memo<TokenSelectButtonProps>(function TokenSelectButton({
  className,
}) {
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const selection = useAppSelector(selectTransactSelected);
  const numTokenOptions = useAppSelector(selectTransactNumTokens);
  const multipleOptions = numTokenOptions > 1;

  const handleClick = useCallback(() => {
    dispatch(transactActions.switchStep(TransactStep.TokenSelect));
  }, [dispatch]);

  return (
    <button
      onClick={multipleOptions ? handleClick : undefined}
      className={clsx(classes.button, className, { [classes.buttonMore]: multipleOptions })}
    >
      <TokensImage tokens={selection.tokens} className={classes.iconAssets} />
      {multipleOptions ? <ExpandMore className={classes.iconMore} /> : null}
    </button>
  );
});

type V3TokenButton = TokenSelectButtonProps & {
  token: TokenEntity;
};

export const V3TokenButton = memo<V3TokenButton>(function V3TokenButton({ className, token }) {
  const classes = useStyles();

  return (
    <div className={clsx(classes.button, className)}>
      <TokensImage tokens={[token]} className={classes.iconAssets} />
    </div>
  );
});
