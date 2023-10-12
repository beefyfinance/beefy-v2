import React, { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { selectBridgeFormState } from '../../../../../data/selectors/bridge';
import { selectChainById } from '../../../../../data/selectors/chains';
import clsx from 'clsx';
import type { ChainEntity } from '../../../../../data/entities/chain';
import { ChainIcon } from '../ChainIcon';
import { useTranslation } from 'react-i18next';
import { bridgeActions, FormStep } from '../../../../../data/reducers/wallet/bridge';

const useStyles = makeStyles(styles);

type ChainButtonProps = {
  chainId: ChainEntity['id'];
  step: FormStep;
  className?: string;
};

const ChainButton = memo<ChainButtonProps>(function ChainButton({ chainId, step, className }) {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const chain = useAppSelector(state => selectChainById(state, chainId));
  const handleClick = useCallback(() => {
    dispatch(bridgeActions.setStep({ step }));
  }, [dispatch, step]);

  return (
    <button className={clsx(classes.btn, classes.chain, className)} onClick={handleClick}>
      <ChainIcon chainId={chainId} className={classes.icon} />
      {chain.name}
    </button>
  );
});

const ArrowButton = memo(function ArrowButton() {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const handleClick = useCallback(() => {
    dispatch(bridgeActions.reverseDirection());
  }, [dispatch]);

  return (
    <button className={clsx(classes.btn, classes.arrowButton)} onClick={handleClick}>
      <div className={classes.arrow}>
        <div className={classes.arrowInner} />
      </div>
    </button>
  );
});

export type ChainSelectorProps = {
  className?: string;
};

export const ChainSelector = memo<ChainSelectorProps>(function ChainSelector({ className }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const { from, to } = useAppSelector(selectBridgeFormState);

  return (
    <div className={clsx(classes.group, className)}>
      <div className={classes.labels}>
        <div className={classes.label}>{t('FROM')}</div>
        <div className={classes.label}>{t('TO')}</div>
      </div>
      <div className={classes.buttons}>
        <ChainButton className={classes.from} chainId={from} step={FormStep.SelectFromNetwork} />
        <ArrowButton />
        <ChainButton className={classes.to} chainId={to} step={FormStep.SelectToNetwork} />
      </div>
    </div>
  );
});
