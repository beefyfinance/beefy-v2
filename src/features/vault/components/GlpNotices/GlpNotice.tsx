import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { memo, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useAsync } from '../../../../helpers/useAsync';
import { isAfter } from 'date-fns';
import { AlertError, AlertWarning } from '../../../../components/Alerts';
import { TimeUntil } from '../../../../components/TimeUntil';

const useStyles = makeStyles(styles);

export type GlpNoticeProps = {
  noticeKey: string;
  noticeKeyUnlocks: string;
  onChange: (isLocked: boolean) => void;
  fetchUnlockTime: () => Promise<Date>;
};
export const GlpNotice = memo<GlpNoticeProps>(function GlpNotice({
  noticeKey,
  noticeKeyUnlocks,
  onChange,
  fetchUnlockTime,
}) {
  const classes = useStyles();
  const { t } = useTranslation();

  const {
    execute: updateUnlockTime,
    status: updateStatus,
    value: unlockTime,
  } = useAsync(fetchUnlockTime, new Date(0));

  const [haveUpdatedOnce, setHaveUpdatedOnce] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const handle = setInterval(updateUnlockTime, 30000);
    return () => clearInterval(handle);
  }, [updateUnlockTime]);

  useEffect(() => {
    if (haveUpdatedOnce === false && updateStatus === 'success') {
      setHaveUpdatedOnce(true);
    }
  }, [updateStatus, haveUpdatedOnce, setHaveUpdatedOnce]);

  useEffect(() => {
    if (haveUpdatedOnce) {
      const handle = setInterval(() => {
        const now = new Date();
        setIsLocked(isAfter(unlockTime, now));
      }, 1000);

      return () => clearInterval(handle);
    }
  }, [unlockTime, haveUpdatedOnce, setIsLocked]);

  useEffect(() => {
    onChange(isLocked);
  }, [onChange, isLocked]);

  const AlertComponent = isLocked ? AlertError : AlertWarning;

  console.log(isLocked, unlockTime);

  return (
    <AlertComponent className={classes.alert}>
      <p>{t(noticeKey)}</p>
      {haveUpdatedOnce && isLocked ? (
        <p>
          <Trans
            t={t}
            i18nKey={noticeKeyUnlocks}
            components={{
              countdown: <TimeUntil time={unlockTime} minParts={1} />,
            }}
          />
        </p>
      ) : null}
    </AlertComponent>
  );
});
