import { memo, useEffect, useState } from 'react';
import { formatTimeUntil } from '../../helpers/date';
import { isDate } from 'date-fns';

export type CountdownProps = {
  time: Date;
  maxParts?: number;
  minParts?: number;
};
export const Countdown = memo<CountdownProps>(function ({ time, minParts = 3, maxParts = 3 }) {
  const [formatted, setFormatted] = useState(() => formatTimeUntil(time, maxParts, minParts));

  useEffect(() => {
    const handle = setInterval(() => {
      setFormatted(formatTimeUntil(time, maxParts, minParts));
    }, 1000);
    return () => clearInterval(handle);
  }, [time, setFormatted, minParts, maxParts]);

  return <>{formatted}</>;
});

export type TimeUntilProps = {
  time?: Date;
} & Omit<CountdownProps, 'time'>;
export const TimeUntil = memo<TimeUntilProps>(function ({ time, ...rest }) {
  if (time && isDate(time)) {
    return <Countdown time={time} {...rest} />;
  }

  return null;
});
