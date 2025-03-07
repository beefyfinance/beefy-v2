import { memo } from 'react';
import { legacyMakeStyles } from '../../helpers/mui.ts';
import { styles } from './styles.ts';
import { Introduction } from './components/Introduction/Introduction.tsx';
import { Bridge } from './components/Bridge/Bridge.tsx';
import { PoweredBy } from './components/PoweredBy/PoweredBy.tsx';
import { Container } from '../../components/Container/Container.tsx';
import { Hidden } from '../../components/MediaQueries/Hidden.tsx';

const useStyles = legacyMakeStyles(styles);

const BridgePage = memo(function BridgePage() {
  const classes = useStyles();

  return (
    <Container maxWidth="lg" css={styles.pageContainer}>
      <div className={classes.inner}>
        <div className={classes.intro}>
          <Introduction />
          <Hidden to="sm">
            <PoweredBy />
          </Hidden>
        </div>
        <Bridge />
        <Hidden from="md">
          <PoweredBy />
        </Hidden>
      </div>
    </Container>
  );
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default BridgePage;
