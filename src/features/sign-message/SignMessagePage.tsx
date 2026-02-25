import { memo } from 'react';
import { Introduction } from './components/Introduction/Introduction.tsx';
import { SignMessageCard } from './components/SignMessageCard/SignMessageCard.tsx';
import { PageWithIntroAndContentLayout } from '../../components/PageWithIntroAndContentLayout/PageWithIntroAndContentLayout.tsx';

const SignMessagePage = memo(function SignMessagePage() {
  return (
    <PageWithIntroAndContentLayout introduction={<Introduction />} content={<SignMessageCard />} />
  );
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default SignMessagePage;
