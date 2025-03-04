import { memo, useEffect, useRef } from 'react';
import Timer from '../../../../../../../images/icons/mui/Timer.svg?react';
import { legacyMakeStyles } from '../../../../../../../helpers/mui.ts';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

type TimeCountdownProps = {
  until: number;
};
export const TimeCountdown = memo(function TimeCountdown({ until }: TimeCountdownProps) {
  const classes = useStyles();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const start = Date.now();
      if (start < until) {
        const id = setInterval(() => {
          const left = (until - Date.now()) / 1000;
          if (ref.current) {
            if (left > 0) {
              ref.current.innerHTML = `${left > 10 ? left.toFixed(0) : left.toFixed(1)}s`;
            } else {
              clearInterval(id);
            }
          }
        }, 100);
        return () => clearInterval(id);
      } else {
        ref.current.innerHTML = '';
      }
    }
  }, [ref, until]);

  return (
    <div className={classes.timer}>
      <Timer height={16} className={classes.icon} />
      <div ref={ref} />
    </div>
  );
});
