import { memo, useEffect, useState } from 'react';
import { formatTimeUntil } from '../../helpers/date.ts';
import { isDate } from 'date-fns';

export type CountdownProps = {
  time: Date;
  maxParts?: number;
  minParts?: number;
};
export const Countdown = memo(function Countdown({
  time,
  minParts = 3,
  maxParts = 3,
}: CountdownProps) {
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
export const TimeUntil = memo(function TimeUntil({ time, ...rest }: TimeUntilProps) {
  if (time && isDate(time)) {
    return <Countdown time={time} {...rest} />;
  }

  return null;
});
