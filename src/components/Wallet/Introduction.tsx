import { useTranslation } from 'react-i18next';
import { styled } from '@repo/styles/jsx';

export function Introduction() {
  const { t } = useTranslation();
  return (
    <Layout>
      <Title>{t('WalletSelect-Title')}</Title>
      <Description>{t('WalletSelect-Description')}</Description>
    </Layout>
  );
}

const Layout = styled('div', {
  base: {
    flex: '0 0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
});

const Title = styled('h2', {
  base: {
    margin: 0,
  },
});

const Description = styled('p', {
  base: {
    margin: 0,
    color: 'text.middle',
  },
});
