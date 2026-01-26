import { memo } from 'react';
import { legacyMakeStyles } from '../../helpers/mui.ts';
import { styles } from './styles.ts';
import { Introduction } from './components/Introduction/Introduction.tsx';
import { SignMessageCard } from './components/SignMessageCard/SignMessageCard.tsx';
import { Container } from '../../components/Container/Container.tsx';
import { PageLayout } from '../../components/PageLayout/PageLayout.tsx';

const useStyles = legacyMakeStyles(styles);

const SignMessagePage = memo(function SignMessagePage() {
  const classes = useStyles();

  return (
    <PageLayout
      content={
        <Container maxWidth="lg" css={styles.pageContainer}>
          <div className={classes.inner}>
            <div className={classes.intro}>
              <Introduction />
            </div>
            <SignMessageCard />
          </div>
        </Container>
      }
    />
  );
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default SignMessagePage;
