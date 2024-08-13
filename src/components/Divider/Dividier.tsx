import { ReactComponent as ArrowDown } from '../../images/icons/arrowDown.svg';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { memo } from 'react';

const useStyles = makeStyles(styles);

interface DividerProps {
  onClick?: () => void;
  clickleable?: boolean;
}

export const Divider = memo<DividerProps>(function Divider({ onClick, clickleable }) {
  const classes = useStyles({ clickleable });
  return (
    <div className={classes.customDivider}>
      <div className={classes.line} />
      <div className={classes.arrowContainer}>
        <ArrowDown onClick={onClick} />
      </div>
      <div className={classes.line} />
    </div>
  );
});
