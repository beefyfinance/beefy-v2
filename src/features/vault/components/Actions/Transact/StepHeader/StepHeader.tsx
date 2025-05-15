import type { ReactNode } from 'react';
import { memo } from 'react';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { styles } from './styles.ts';
import BackArrow from '../../../../../../images/back-arrow.svg?react';

const useStyles = legacyMakeStyles(styles);

export type StepHeaderProps = {
  onBack?: () => void;
  children: ReactNode;
};
export const StepHeader = memo(function StepHeader({ onBack, children }: StepHeaderProps) {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      {onBack ?
        <button type="button" onClick={onBack} className={classes.backButton}>
          <BackArrow className={classes.backIcon} />
        </button>
      : null}
      {children}
    </div>
  );
});
