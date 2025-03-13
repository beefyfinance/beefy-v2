import { memo, useCallback } from 'react';
import { legacyMakeStyles } from '../../../../../../helpers/mui.ts';
import { styles } from './styles.ts';
import { css, type CssStyles } from '@repo/styles/css';
import SwitchIcon from '../../../../../../images/switcher.svg?react';
import { onRampFormActions } from '../../../../../data/reducers/on-ramp.ts';
import { useAppDispatch } from '../../../../../../store.ts';

const useStyles = legacyMakeStyles(styles);

export type InputSwitcherProps = {
  css?: CssStyles;
};

export const InputSwitcher = memo(function InputSwitcher({ css: cssProp }: InputSwitcherProps) {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const setInputMode = useCallback(() => dispatch(onRampFormActions.toggleInputMode()), [dispatch]);

  return (
    <div className={css(styles.switcher, cssProp)}>
      <button type="button" onClick={setInputMode} className={classes.button}>
        <SwitchIcon className={classes.icon} />
      </button>
    </div>
  );
});
