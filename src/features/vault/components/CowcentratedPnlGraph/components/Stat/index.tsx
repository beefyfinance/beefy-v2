import { makeStyles, type Theme } from '@material-ui/core';
import clsx from 'clsx';
import React, { memo, type ReactNode } from 'react';

interface StatProps {
  label: string;
  value0: string;
  value1: string;
  value2?: ReactNode;
  subValue0?: string;
  subValue1?: string;
  subValue2?: ReactNode;
  value2ClassName?: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    padding: '16px 24px',
    backgroundColor: theme.palette.background.contentPrimary,
    [theme.breakpoints.down('xs')]: {
      padding: '16px',
    },
  },
  label: {
    ...theme.typography['body-sm-med'],
    fontWeight: 700,
    color: theme.palette.text.dark,
    textTransform: 'uppercase' as const,
  },
  value: {
    ...theme.typography['body-lg-med'],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    color: theme.palette.text.primary,
  },
  subValue: {
    ...theme.typography['body-sm-med'],
    color: theme.palette.text.secondary,
  },
  lastValue: {
    color: theme.palette.text.dark,
  },
}));

export const Stat = memo<StatProps>(function Stat({
  label,
  value0,
  value1,
  subValue0,
  subValue1,
  value2,
  subValue2,
  value2ClassName,
}) {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <div className={classes.label}>{label}</div>
      <div className={classes.value}>
        {value0}
        {subValue0 && <div className={classes.subValue}>{subValue0}</div>}
      </div>
      <div className={classes.value}>
        {value1}
        {subValue1 && <div className={classes.subValue}>{subValue1}</div>}
      </div>
      {value2 && (
        <div className={clsx(classes.value, classes.lastValue, value2ClassName)}>
          {value2}
          {subValue2 && <div className={classes.subValue}>{subValue2}</div>}
        </div>
      )}
    </div>
  );
});
