import { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

export type CardTabProps = {
  selected: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  className?: string;
  highlight?: string;
};

export const CardsTabs = memo<CardTabProps>(function CardsTabs({
  selected,
  options,
  onChange,
  className,
  highlight,
}) {
  const classes = useStyles();

  return (
    <div className={clsx(classes.tabs, className)}>
      {options.map(({ value, label }) => (
        <Tab
          key={value}
          label={label}
          value={value}
          onChange={onChange}
          selected={selected === value}
          highlight={highlight === value}
        />
      ))}
    </div>
  );
});

type TabProps = {
  value: string;
  label: string;
  onChange: (selected: string) => void;
  selected: boolean;
  className?: string;
  highlight?: boolean;
};
const Tab = memo<TabProps>(function Tab({
  value,
  label,
  onChange,
  selected,
  highlight,
  className,
}) {
  const classes = useStyles();
  const handleClick = useCallback(() => {
    onChange(value);
  }, [value, onChange]);

  return (
    <button
      className={clsx(classes.tab, className, {
        [classes.selectedTab]: selected,
        [classes.highlightTab]: highlight,
      })}
      onClick={handleClick}
    >
      {label}
    </button>
  );
});
