import React from 'react';
import Box from '@material-ui/core/Box';
import makeStyles from '@material-ui/styles/makeStyles';
import { styles } from './styles';

const useStyles = makeStyles(styles as any);

export const CowLoader = ({ text }) => {
  const classes = useStyles();
  return (
    <Box textAlign="center" className={classes.bifiLoader}>
      <img
        alt="BIFI"
        className={classes.rotateIcon}
        src={require('../../images/BIFI.svg').default}
      />
      <Box className={classes.text}>{text}</Box>
    </Box>
  );
};
