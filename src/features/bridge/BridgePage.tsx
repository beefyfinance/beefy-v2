import { memo } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Hidden } from '@material-ui/core';
import { styles } from './styles';
import Introduction from './components/Introduction';
import Bridge from './components/Bridge';
import PoweredBy from './components/PoweredBy';
import { Container } from '../../components/Container/Container';

const useStyles = makeStyles(styles);

export const BridgePage = memo(function BridgePage() {
  const classes = useStyles();

  return (
    <Container maxWidth="lg" className={classes.pageContainer}>
      <div className={classes.inner}>
        <div className={classes.intro}>
          <Introduction />
          <Hidden smDown>
            <PoweredBy />
          </Hidden>
        </div>
        <Bridge />
        <Hidden mdUp>
          <PoweredBy />
        </Hidden>
      </div>
    </Container>
  );
});
