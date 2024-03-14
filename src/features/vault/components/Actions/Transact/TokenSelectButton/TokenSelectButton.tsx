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
import zapIcon from '../../../../../../images/icons/zap.svg';
import { useTranslation } from 'react-i18next';

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
      {selection === undefined ? (
        <div className={classes.select}>
          <div className={classes.zapIcon}>
            <img src={zapIcon} alt="zap" />
          </div>
          {t('Select')}
        </div>
      ) : (
        <TokensImage tokens={selection.tokens} className={classes.iconAssets} size={24} />
      )}
      {multipleOptions ? <ExpandMore className={classes.iconMore} /> : null}
    </button>
  );
});
