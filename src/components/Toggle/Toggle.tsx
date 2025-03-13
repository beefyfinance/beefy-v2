import type { ChangeEventHandler, ReactNode } from 'react';
import { memo, useCallback } from 'react';
import { legacyMakeStyles } from '../../helpers/mui.ts';
import { styles } from './styles.ts';
import { css, type CssStyles } from '@repo/styles/css';

const useStyles = legacyMakeStyles(styles);

export type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  css?: CssStyles;
};

export const Toggle = memo(function Toggle({
  checked,
  onChange,
  startAdornment,
  endAdornment,
  css: cssProp,
}: ToggleProps) {
  const classes = useStyles();
  const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    e => {
      onChange(e.target.checked);
    },
    [onChange]
  );

  return (
    <label className={css(styles.label, cssProp)}>
      {startAdornment ?? null}
      <input
        type="checkbox"
        value="1"
        checked={checked}
        onChange={handleChange}
        className={classes.input}
      />
      <div className={classes.channel}>
        <div className={css(styles.dot, checked && styles.dotChecked)} />
      </div>
      {endAdornment ?? null}
    </label>
  );
});
