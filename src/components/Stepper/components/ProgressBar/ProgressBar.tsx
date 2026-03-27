import { css } from '@repo/styles/css';
import { memo } from 'react';
import {
  selectErrorBar,
  selectRecoveryBar,
  selectStepperProgress,
  selectSuccessBar,
} from '../../../../features/data/selectors/stepper.ts';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { useAppSelector } from '../../../../features/data/store/hooks.ts';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

export const ProgressBar = memo(function ProgressBar() {
  const progress = useAppSelector(selectStepperProgress);
  const classes = useStyles();
  const showErrorBar = useAppSelector(selectErrorBar);
  const showSuccessBar = useAppSelector(selectSuccessBar);
  const showRecoveryBar = useAppSelector(selectRecoveryBar);
  const percent = showErrorBar || showSuccessBar ? 100 : progress;

  return (
    <div className={classes.topBar}>
      <div
        className={css(
          styles.bar,
          showErrorBar && styles.errorBar,
          showSuccessBar && styles.successBar,
          showRecoveryBar && styles.recoveryBar,
          !showErrorBar && !showSuccessBar && !showRecoveryBar && styles.progressBar
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
});
