import { memo, type ReactNode, useMemo } from 'react';
import { format } from 'date-fns';
import { DivWithTooltip } from '../../../../../../components/Tooltip/DivWithTooltip.tsx';
import { BasicTooltipContent } from '../../../../../../components/Tooltip/BasicTooltipContent.tsx';
import { TimeUntil } from '../../../../../../components/TimeUntil/TimeUntil.tsx';
import type { FormatTimeLabels } from '../../../../../../helpers/date.ts';
import { NotificationPill } from '../../../../../components/NotificationPill.tsx';
import { rpcClientManager } from '../../../../../data/apis/rpc-contract/rpc-manager.ts';
import { featureFlag_sonicTestnet } from '../../../../../data/utils/feature-flags.ts';

type CountdownProps = {
  until: number;
  children: ReactNode;
};

const labels: FormatTimeLabels = {
  days: (count: number) => ` day${count !== 1 ? 's' : ''}`,
  hours: (count: number) => ` hour${count !== 1 ? 's' : ''}`,
  minutes: (count: number) => ` minute${count !== 1 ? 's' : ''}`,
  seconds: (count: number) => ` second${count !== 1 ? 's' : ''}`,
};

// TODO remove beSonic
let offset = 0;
if (featureFlag_sonicTestnet()) {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  rpcClientManager
    .getBatchClient('sonic')
    .getBlock({ blockTag: 'latest' })
    .then(block => {
      offset = Number(block.timestamp.toString(10)) * 1000 - Date.now();
      console.log(`Testnet Offset: ${offset}`);
    });
}

export const Countdown = memo(function Countdown({ until, children }: CountdownProps) {
  const { time, renderFuture } = useMemo(() => {
    const date = new Date(until * 1000);
    const formatted = format(date, 'MMM d, yyyy h:mm a');
    return {
      time: date,
      renderFuture: (timeLeft: string) => (
        <DivWithTooltip tooltip={<BasicTooltipContent title={formatted} />}>
          <NotificationPill mode="teaser" text={timeLeft} />
        </DivWithTooltip>
      ),
    };
  }, [until]);

  return (
    <TimeUntil
      time={time}
      minParts={1}
      maxParts={1}
      padLength={1}
      labels={labels}
      renderFuture={renderFuture}
      renderPast={children}
      from={offset > 0 ? new Date(Date.now() + offset) : undefined} // TODO remove beSonic
    />
  );
});
