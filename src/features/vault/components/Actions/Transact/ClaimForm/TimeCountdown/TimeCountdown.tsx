import { memo, useEffect, useRef } from 'react';
import { Timer } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';

const useStyles = makeStyles(styles);

type TimeCountdownProps = {
  until: number;
};
export const TimeCountdown = memo<TimeCountdownProps>(function TimeCountdown({ until }) {
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
