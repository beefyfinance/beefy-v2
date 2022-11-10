import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export const MobileMenu = memo(function () {
  const classes = useStyles();
  return <div>MobileMenu</div>;
});
