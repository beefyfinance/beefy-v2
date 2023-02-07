import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { styles } from './styles';

const useStyles = makeStyles(styles);

export const Title = memo(function () {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t } = useTranslation();

  const classes = useStyles();

  const items: TitleItemProps[] = useMemo(() => {
    return [
      {
        label: 'At Deposit',
        value: '15.01',
        subValue: '$43,882.33',
        border: false,
      },
      {
        label: 'Now',
        value: '15.05',
        subValue: '$41,882.33',
      },
      {
        label: 'Yield',
        value: '+0.005',
        subValue: '$184',
        valueClassName: classes.greenValue,
      },
      {
        label: 'PNL',
        value: '-15000',
      },
    ];
  }, [classes.greenValue]);

  return (
    <div className={classes.title}>
      {items.map(item => (
        <TitleItem
          label={item.label}
          value={item.value}
          subValue={item.subValue}
          valueClassName={item.valueClassName}
          border={item.border}
        />
      ))}
    </div>
  );
});

interface TitleItemProps {
  label: string;
  value: string;
  subValue?: string;
  valueClassName?: string;
  border?: boolean;
}

const TitleItem = memo<TitleItemProps>(function ({
  label,
  value,
  subValue,
  valueClassName,
  border = true,
}) {
  const classes = useStyles();
  return (
    <div className={classes.itemContainer}>
      {border && <div className={classes.border} />}
      <div className={classes.textContainer}>
        <div className={classes.label}>{label}</div>
        <div className={clsx(classes.value, valueClassName)}>{value}</div>
        {subValue && <div className={classes.subValue}>{subValue}</div>}
      </div>
    </div>
  );
});
