import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Meta } from './Meta.tsx';

export type DashboardMetaProps = {
  wallet?: string;
};

export const DashboardMeta = memo(function DashboardMeta({ wallet }: DashboardMetaProps) {
  const { t } = useTranslation();
  const titleKey = wallet ? 'Meta-Dashboard-Title-Wallet' : 'Meta-Dashboard-Title';
  return <Meta title={t(titleKey, { wallet })} description={t('Meta-Dashboard-Description')} />;
});
