import type { ReactNode } from 'react';
import { memo } from 'react';
import { legacyMakeStyles } from '../../helpers/mui.ts';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);
const LabeledStatImpl = ({ value, boosted }: { value: ReactNode; boosted?: ReactNode }) => {
  const classes = useStyles();

  return (
    <>
      {boosted && <div className={classes.value}>{boosted}</div>}
      <div className={boosted ? classes.valueStrikethrough : classes.value}>{value}</div>
    </>
  );
};

export const LabeledStat = memo(LabeledStatImpl);
