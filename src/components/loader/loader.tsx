import { Box, makeStyles } from '@material-ui/core';
import { styles } from './styles';

const useStyles = makeStyles(styles as any);
export const Loader = ({ message, line }: { message?: string; line?: boolean }) => {
  const classes = useStyles();
  return (
    <Box textAlign={'center'}>
      {message}
      <Box className={line ? classes.line : classes.circle} />
    </Box>
  );
};
