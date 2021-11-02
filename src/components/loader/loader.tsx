import { Box, makeStyles } from '@material-ui/core';
import React from 'react';
import { LoaderProps } from './LoaderProps';
import { styles } from './styles';

const useStyles = makeStyles(styles as any);
export const Loader: React.FC<LoaderProps> = ({ message, line }) => {
  const classes = useStyles();
  return (
    <Box textAlign={'center'}>
      {message}
      <Box className={line ? classes.line : classes.circle} />
    </Box>
  );
};
