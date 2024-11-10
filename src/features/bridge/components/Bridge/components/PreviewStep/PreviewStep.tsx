import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Step } from '../../../../../../components/Step';
import { Preview } from '../Preview';

const PreviewStepImpl = () => {
  const { t } = useTranslation();
  return (
    <Step stepType="bridge" title={t('Bridge-PreviewStep-Title')}>
      <Preview />
    </Step>
  );
};

export const PreviewStep = memo(PreviewStepImpl);
