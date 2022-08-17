import React, { memo } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Container } from '@material-ui/core';
import { styles } from './styles';
import Introduction from './components/Introduction';
import OnRamp from './components/OnRamp';

const useStyles = makeStyles(styles);

export const OnRampPage = memo(function () {
  const classes = useStyles();
  return (
    <Container maxWidth="lg" className={classes.pageContainer}>
      <div className={classes.inner}>
        <Introduction />
        <OnRamp />
      </div>
    </Container>
  );
});
