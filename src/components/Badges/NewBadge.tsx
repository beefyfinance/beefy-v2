import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@repo/styles/jsx';
import type { BadgeComponentProps } from './types.ts';

const NewText = memo<BadgeComponentProps>(function NewText({ className }) {
  const { t } = useTranslation();
  return <div className={className}>{t('Header-Badge-New')}</div>;
});

export const NewBadge = styled(NewText, {
  base: {
    textStyle: 'body.sm.bold',
    fontWeight: 600,
    backgroundColor: 'green.80-40',
    color: 'green.40',
    paddingInline: '6px',
    borderRadius: '4px',
    height: '20px',
    pointerEvents: 'none',
    userSelect: 'none',
  },
});
