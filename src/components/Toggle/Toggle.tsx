import { ChangeEventHandler, memo, ReactNode, useCallback } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

export type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  className?: string;
};

export const Toggle = memo<ToggleProps>(function Toggle({
  checked,
  onChange,
  startAdornment,
  endAdornment,
  className,
}) {
  const classes = useStyles();
  const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    e => {
      onChange(e.target.checked);
    },
    [onChange]
  );

  return (
    <label className={clsx(classes.label, className)}>
      {startAdornment ?? null}
      <input
        type="checkbox"
        value="1"
        checked={checked}
        onChange={handleChange}
        className={classes.input}
      />
      <div className={classes.channel}>
        <div className={clsx(classes.dot, { [classes.dotChecked]: checked })} />
      </div>
      {endAdornment ?? null}
    </label>
  );
});
