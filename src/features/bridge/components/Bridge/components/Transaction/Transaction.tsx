import { memo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../../../components/Button/Button.tsx';
import { LoadingIndicator } from '../../../../../../components/LoadingIndicator/LoadingIndicator.tsx';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import { bridgeActions } from '../../../../../data/reducers/wallet/bridge.ts';
import { selectBridgeTxState } from '../../../../../data/selectors/bridge.ts';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

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
