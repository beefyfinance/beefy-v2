import { memo } from 'react';
import { makeStyles } from '@material-ui/styles';
import { styles } from './styles';
import Introduction from './components/Introduction';
import OnRamp from './components/OnRamp';
import { Container } from '../../components/Container/Container';

const useStyles = makeStyles(styles);

export const OnRampPage = memo(function OnRampPage() {
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
