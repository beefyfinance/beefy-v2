import React, { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import {
  selectTransactNumTokens,
  selectTransactSelectedTokens,
} from '../../../../../data/selectors/transact';
import { transactActions } from '../../../../../data/reducers/wallet/transact';
import clsx from 'clsx';
import { ExpandMore } from '@material-ui/icons';
import { TokensImage } from '../../../../../../components/TokenImage/TokenImage';
import { TransactStep } from '../../../../../data/reducers/wallet/transact-types';

const useStyles = makeStyles(styles);

export type TokenSelectButtonProps = {
  className?: string;
};

export const TokenSelectButton = memo<TokenSelectButtonProps>(function ({ className }) {
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const selectedTokens = useAppSelector(selectTransactSelectedTokens);
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
      <TokensImage tokens={selectedTokens} className={classes.iconAssets} />
      {multipleOptions ? <ExpandMore className={classes.iconMore} /> : null}
    </button>
  );
});
