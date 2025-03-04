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
    textStyle: 'body.sm',
    backgroundColor: 'green',
    color: 'background.header',
    paddingInline: '6px',
    borderRadius: '10px',
    height: '20px',
    pointerEvents: 'none',
    userSelect: 'none',
  },
});
