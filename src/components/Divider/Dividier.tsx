import { ReactComponent as ArrowDown } from '../../images/icons/arrowDown.svg';
import { Box, makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { memo } from 'react';

const useStyles = makeStyles(styles);

const _Divider = ({ onClick, clickleable }: { onClick?: () => void; clickleable?: boolean }) => {
  const classes = useStyles({ clickleable });
  return (
    <Box className={classes.customDivider}>
      <Box className={classes.line} />
      <Box className={classes.arrowContainer}>
        <ArrowDown onClick={onClick} />
      </Box>
      <Box className={classes.line} />
    </Box>
  );
};

export const Divider = memo(_Divider);
