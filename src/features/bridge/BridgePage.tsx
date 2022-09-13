import React, { memo } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Container } from '@material-ui/core';
import { styles } from './styles';
import Introduction from './components/Introduction';
import Bridge from './components/Bridge';
import { useAppDispatch } from '../../store';
import { bridgeActions } from '../data/reducers/wallet/bridge';

const useStyles = makeStyles(styles);

export const BridgePage = memo(function () {
  const classes = useStyles();
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    return () => {
      dispatch(bridgeActions.resetForm());
    };
  }, [dispatch]);

  return (
    <Container maxWidth="lg" className={classes.pageContainer}>
      <div className={classes.inner}>
        <Introduction />
        <Bridge />
      </div>
    </Container>
  );
});
