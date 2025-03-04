import { memo } from 'react';
import { legacyMakeStyles } from '../../helpers/mui.ts';
import { styles } from './styles.ts';
import { Introduction } from './components/Introduction/Introduction.tsx';
import { OnRamp } from './components/OnRamp/OnRamp.tsx';
import { Container } from '../../components/Container/Container.tsx';

const useStyles = legacyMakeStyles(styles);

const OnRampPage = memo(function OnRampPage() {
  const classes = useStyles();
  return (
    <Container maxWidth="lg" css={styles.pageContainer}>
      <div className={classes.inner}>
        <Introduction />
        <OnRamp />
      </div>
    </Container>
  );
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default OnRampPage;
