import React, { memo, useCallback, useEffect } from 'react';
import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../../../components/Button';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { styles } from './styles';
import { bridgeActions } from '../../../../../data/reducers/wallet/bridge';
import { selectBridgeTxState } from '../../../../../data/selectors/bridge';
import { LoadingIndicator } from '../../../../../../components/LoadingIndicator';

const useStyles = makeStyles(styles);

export const Transaction = memo(function Transaction() {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { step, status } = useAppSelector(selectBridgeTxState);
  const handleStartOver = useCallback(() => {
    dispatch(bridgeActions.restart());
  }, [dispatch]);

  useEffect(() => {
    if (step === 'unknown' || status === 'error' || (step === 'bridge' && status === 'success')) {
      handleStartOver();
    }
  }, [step, status, handleStartOver]);

  return (
    <>
      <div className={classes.steps}>
        <LoadingIndicator
          text={t([
            `Bridge-Transaction-Progress-${step}-${status}`,
            `Bridge-Transaction-Progress-${step}`,
          ])}
        />
      </div>
      <div className={classes.buttonsContainer}>
        <Button onClick={handleStartOver} variant="success" fullWidth={true} borderless={true}>
          {t('Bridge-Transaction-StartOver')}
        </Button>
      </div>
    </>
  );
});
