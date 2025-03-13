import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { memo } from 'react';
import { css } from '@repo/styles/css';
import {
  selectErrorBar,
  selectStepperProgress,
  selectSuccessBar,
} from '../../../../features/data/selectors/stepper.ts';
import { useAppSelector } from '../../../../store.ts';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

export const ProgressBar = memo(function ProgressBar() {
  const progress = useAppSelector(selectStepperProgress);
  const classes = useStyles();
  const showErrorBar = useAppSelector(selectErrorBar);
  const showSuccessBar = useAppSelector(selectSuccessBar);
  const percent = !showErrorBar && !showSuccessBar ? progress : 100;

  return (
    <div className={classes.topBar}>
      <div
        className={css(
          styles.bar,
          showErrorBar && styles.errorBar,
          showSuccessBar && styles.successBar,
          !showErrorBar && !showSuccessBar && styles.progressBar
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
});
