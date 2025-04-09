import { memo, type ReactNode, useEffect, useState } from 'react';
import { formatTimeUntil, type FormatTimeUntilOptions } from '../../helpers/date.ts';
import { isAfter, isDate } from 'date-fns';

export type CountdownProps = {
  time: Date;
  renderFuture?: (formatted: string) => ReactNode;
  renderPast?: ReactNode | (() => ReactNode);
} & FormatTimeUntilOptions;

export const Countdown = memo(function Countdown({
  time,
  renderFuture,
  renderPast,
  ...timeUntilOptions
}: CountdownProps) {
  const [status, setStatus] = useState<'past' | 'future'>(() =>
    isAfter(timeUntilOptions.from || new Date(), time) ? 'past' : 'future'
  );
  const [formatted, setFormatted] = useState(() => formatTimeUntil(time, timeUntilOptions));

  useEffect(() => {
    if (status === 'past') {
      return;
    }

    const handle = setInterval(() => {
      const now = timeUntilOptions.from || new Date();
      setFormatted(formatTimeUntil(time, { ...timeUntilOptions, from: now }));

      if (isAfter(now, time)) {
        setStatus('past');
        clearInterval(handle);
      }
    }, 1000);

    return () => clearInterval(handle);
  }, [time, setFormatted, timeUntilOptions, status, setStatus]);

  if (status === 'future' || !renderPast) {
    return <>{renderFuture ? renderFuture(formatted) : formatted}</>;
  }

  return typeof renderPast === 'function' ? renderPast() : renderPast;
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
