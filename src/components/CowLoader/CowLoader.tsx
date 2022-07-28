import React from 'react';
import { Box, makeStyles } from '@material-ui/core';
import { styles } from './styles';
import BIFILogo from '../../images/bifi-logos/BIFI-COW.svg';

const useStyles = makeStyles(styles);

export const CowLoader = ({ text }) => {
  const classes = useStyles();
  return (
    <Box textAlign="center">
      <img alt="BIFI" className={classes.rotateIcon} src={BIFILogo} />
      <Box className={classes.text}>{text}</Box>
    </Box>
  );
};
