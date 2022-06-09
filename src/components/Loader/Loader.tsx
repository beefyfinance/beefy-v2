import { Box, makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { styles } from './styles';

const useStyles = makeStyles(styles);
export const Loader = ({ message, line }: { message?: string; line?: boolean }) => {
  const classes = useStyles();
  return (
    <Box component="span" className={classes.span} textAlign={'center'}>
      {message}
      <Box component="span" className={clsx(line ? classes.line : classes.circle, classes.span)} />
    </Box>
  );
};
