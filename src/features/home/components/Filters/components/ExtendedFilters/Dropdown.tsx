import { memo, useCallback } from 'react';
import { Floating, FloatingProps } from '../../../../../../components/Floating';
import { ClickAwayListener, ClickAwayListenerProps, makeStyles, Portal } from '@material-ui/core';
import { styles } from './styles';
import { ExtendedFilters } from './ExtendedFilters';

const useStyles = makeStyles(styles);

export type DropdownProps = Omit<
  FloatingProps,
  'children' | 'autoHeight' | 'autoWidth' | 'className'
> & {
  onClose: () => void;
};

export const Dropdown = memo<DropdownProps>(function ({ onClose, ...rest }) {
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
      <Floating {...rest} autoHeight={false} autoWidth={false} className={classes.dropdown}>
        <ClickAwayListener onClickAway={handleClose}>
          <div className={classes.dropdownInner}>
            <ExtendedFilters desktopView={true} />
          </div>
        </ClickAwayListener>
      </Floating>
    </Portal>
  );
});
