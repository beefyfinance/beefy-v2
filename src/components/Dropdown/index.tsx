import { memo, useCallback } from 'react';
import { ClickAwayListener, ClickAwayListenerProps, makeStyles, Portal } from '@material-ui/core';
import { styles } from './styles';
import { Floating, FloatingProps } from '../Floating';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

export type DropdownProps = Omit<FloatingProps, 'autoHeight' | 'autoWidth' | 'className'> & {
  onClose: () => void;
  dropdownClassName?: string;
  innerClassName?: string;
};

export const Dropdown = memo<DropdownProps>(function ({
  onClose,
  children,
  dropdownClassName,
  innerClassName,
  ...rest
}) {
  const classes = useStyles();
  const handleClose = useCallback<ClickAwayListenerProps['onClickAway']>(
    e => {
      e.stopPropagation();
      onClose();
    },
    [onClose]
  );

  return (
    <Portal>
      <Floating
        {...rest}
        autoHeight={false}
        autoWidth={false}
        className={clsx(classes.dropdown, dropdownClassName)}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <div className={clsx(classes.dropdownInner, innerClassName)}>{children}</div>
        </ClickAwayListener>
      </Floating>
    </Portal>
  );
});
