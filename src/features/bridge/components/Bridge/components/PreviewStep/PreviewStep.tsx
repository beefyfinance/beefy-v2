import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Step } from '../Step';
import { Preview } from '../Preview';

const _PreviewStep = () => {
  const { t } = useTranslation();
  return (
    <Step title={t('Bridge-PreviewStep-Title')}>
      <Preview />
    </Step>
  );
};

export const PreviewStep = memo(_PreviewStep);
