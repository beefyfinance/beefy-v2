import React, { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';
import { useAppDispatch } from '../../../../../../store';
import { bridgeActions } from '../../../../../data/reducers/wallet/bridge';
import { FormStep } from '../../../../../data/reducers/wallet/bridge';
import { ButtonAdornment } from '../../../../../../components/ButtonAdornment';
import { ChainIcon } from '../ChainIcon';
import { ChainEntity } from '../../../../../data/entities/chain';

const useStyles = makeStyles(styles);

export type InputChainAdornmentProps = {
  chain: ChainEntity;
  className?: string;
  nextStep: FormStep;
};
export const InputChainAdornment = memo<InputChainAdornmentProps>(function FiatAmountAdornment({
  chain,
  className,
  nextStep,
}) {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const handleClick = useCallback(() => {
    dispatch(bridgeActions.setStep({ step: nextStep }));
  }, [dispatch, nextStep]);

  return (
    <ButtonAdornment className={clsx(classes.button, className)} onClick={handleClick}>
      <ChainIcon chainId={chain.id} className={classes.icon} />
      {chain.name}
    </ButtonAdornment>
  );
});
