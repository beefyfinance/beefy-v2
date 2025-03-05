import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Step } from '../../../../../../components/Step/Step.tsx';
import { Preview } from '../Preview/Preview.tsx';

const PreviewStepImpl = () => {
  const { t } = useTranslation();
  return (
    <Step stepType="bridge" title={t('Bridge-PreviewStep-Title')}>
      <Preview />
    </Step>
  );
};

export const PreviewStep = memo(PreviewStepImpl);
