import React, { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';
import { ButtonAdornment } from '../ButtonAdornment';
import { useAppDispatch } from '../../../../../../store';
import { onRampFormActions } from '../../../../../data/reducers/on-ramp';
import { AssetsImage } from '../../../../../../components/AssetsImage';
import { FormStep } from '../../../../../data/reducers/on-ramp-types';

const useStyles = makeStyles(styles);

export type TokenAmountAdornmentProps = {
  token: string;
  className?: string;
};
export const TokenAmountAdornment = memo<TokenAmountAdornmentProps>(function TokenAmountAdornment({
  token,
  className,
}) {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const handleClick = useCallback(() => {
    dispatch(onRampFormActions.setStep({ step: FormStep.SelectToken }));
  }, [dispatch]);

  return (
    <ButtonAdornment className={clsx(classes.button, className)} onClick={handleClick}>
      <AssetsImage chainId={undefined} assetIds={[token]} size={24} className={classes.icon} />
      {token}
    </ButtonAdornment>
  );
});
