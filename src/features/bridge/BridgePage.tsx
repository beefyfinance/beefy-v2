import React, { memo } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Container } from '@material-ui/core';
import { styles } from './styles';
import Introduction from './components/Introduction';
import Bridge from './components/Bridge';

const useStyles = makeStyles(styles);

export const BridgePage = memo(function BridgePage() {
  const classes = useStyles();

  return (
    <Container maxWidth="lg" className={classes.pageContainer}>
      <div className={classes.inner}>
        <Introduction />
        <Bridge />
      </div>
    </Container>
  );
});
