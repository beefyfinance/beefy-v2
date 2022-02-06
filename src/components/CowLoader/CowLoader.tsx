import React from 'react';
import { Box, makeStyles } from '@material-ui/core';
import { styles } from './styles';
import BIFILogo from '../../images/BIFI.svg';

const useStyles = makeStyles(styles as any);

export const CowLoader = ({ text }) => {
  const classes = useStyles();
  return (
    <Box textAlign="center" className={classes.bifiLoader}>
      <img alt="BIFI" className={classes.rotateIcon} src={BIFILogo} />
      <Box className={classes.text}>{text}</Box>
    </Box>
  );
};
