import { memo, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useAsync } from '../../../../../../helpers/useAsync.ts';
import { AlertError, AlertWarning } from '../../../../../../components/Alerts/Alerts.tsx';
import { TimeUntil } from '../../../../../../components/TimeUntil/TimeUntil.tsx';
import type { UnlockTimeResult } from './types.ts';
import { formatDistanceStrict } from 'date-fns';

export type GlpNoticeProps = {
  noticeKey: string;
  noticeKeyUnlocks: string;
  onChange: (isLocked: boolean) => void;
  fetchUnlockTime: () => Promise<UnlockTimeResult>;
};
export const GlpNotice = memo(function GlpNotice({
  noticeKey,
  noticeKeyUnlocks,
  onChange,
  fetchUnlockTime,
}: GlpNoticeProps) {
  const { t } = useTranslation();

  const {
    execute: updateUnlockTime,
    status: updateStatus,
    value: unlockInfo,
  } = useAsync(fetchUnlockTime, { unlocksAt: 0, cooldownDuration: 15 * 60 * 1000 });

  const [haveUpdatedOnce, setHaveUpdatedOnce] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [unlocksAt, setUnlocksAt] = useState(() => new Date());

  useEffect(() => {
    const handle = setInterval(updateUnlockTime, 30000);
    return () => clearInterval(handle);
  }, [updateUnlockTime]);

  useEffect(() => {
    if (!haveUpdatedOnce && updateStatus === 'success') {
      setHaveUpdatedOnce(true);
    }
  }, [updateStatus, haveUpdatedOnce, setHaveUpdatedOnce]);

  useEffect(() => {
    if (haveUpdatedOnce && unlockInfo) {
      setUnlocksAt(new Date(unlockInfo.unlocksAt));

      const handle = setInterval(() => {
        setIsLocked(unlockInfo.unlocksAt > Date.now());
      }, 1000);

      return () => clearInterval(handle);
    }
  }, [unlockInfo, haveUpdatedOnce, setIsLocked, setUnlocksAt]);

  useEffect(() => {
    onChange(isLocked);
  }, [onChange, isLocked]);

  const AlertComponent = isLocked ? AlertError : AlertWarning;

  if (!unlockInfo) {
    return null;
  }

  return (
    <AlertComponent>
      <p>
        {t(noticeKey, {
          cooldown: formatDistanceStrict(new Date(0), new Date(unlockInfo.cooldownDuration)),
        })}
      </p>
      {haveUpdatedOnce && isLocked ?
        <p>
          <Trans
            t={t}
            i18nKey={noticeKeyUnlocks}
            components={{
              countdown: <TimeUntil time={unlocksAt} minParts={1} />,
            }}
          />
        </p>
      : null}
    </AlertComponent>
  );
});
