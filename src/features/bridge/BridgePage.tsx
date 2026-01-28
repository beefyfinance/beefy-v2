import { memo } from 'react';
import { Introduction } from './components/Introduction/Introduction.tsx';
import { Bridge } from './components/Bridge/Bridge.tsx';
import { PoweredBy } from './components/PoweredBy/PoweredBy.tsx';
import { Hidden } from '../../components/MediaQueries/Hidden.tsx';
import { PageWithIntroAndContentLayout } from '../../components/PageWithIntroAndContentLayout/PageWithIntroAndContentLayout.tsx';

const BridgePage = memo(function BridgePage() {
  return (
    <PageWithIntroAndContentLayout
      introduction={
        <>
          <Introduction />
          <Hidden to="sm">
            <PoweredBy />
          </Hidden>
        </>
      }
      content={
        <>
          <Bridge />
          <Hidden from="md">
            <PoweredBy />
          </Hidden>
        </>
      }
    />
  );
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default BridgePage;
