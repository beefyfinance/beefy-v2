import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Section } from '../Section';

export const UserVaults = memo(function () {
  const { t } = useTranslation();
  return <Section title={t('Your Vaults')}>x</Section>;
});
