import React, { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { AssetsImage } from '../../../../../../components/AssetsImage';
import clsx from 'clsx';
import { useAppDispatch } from '../../../../../../store';
import { onRampFormActions } from '../../../../../data/reducers/on-ramp';
import { FormStep } from '../../../../../data/reducers/on-ramp-types';

const useStyles = makeStyles(styles);

export type TokenIconAdornmentProps = {
  token: string;
  className?: string;
};
export const TokenIconAdornment = memo<TokenIconAdornmentProps>(function TokenIconAdornment({
  token,
  className,
}) {
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const handleClick = useCallback(() => {
    dispatch(onRampFormActions.setStep({ step: FormStep.SelectToken }));
  }, [dispatch]);

  return (
    <button className={clsx(classes.tokenAdornment, className)} onClick={handleClick}>
      <AssetsImage chainId={undefined} assetIds={[token]} size={24} className={classes.icon} />
      {token}
    </button>
  );
});
