import { memo } from 'react';
import { LoadingIndicator } from '../../../../../../components/LoadingIndicator/LoadingIndicator.tsx';
import { useTranslation } from 'react-i18next';
import { styled } from '@repo/styles/jsx';

export const LoadingStep = memo(function LoadingStep() {
  const { t } = useTranslation();

  return (
    <Container>
      <LoadingIndicator text={t('Transact-Loading')} />
    </Container>
  );
});

const Container = styled('div', {
  base: {
    height: '524px',
  },
});
