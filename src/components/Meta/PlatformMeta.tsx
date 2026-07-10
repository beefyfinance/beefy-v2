import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { type PlatformEntity } from '../../features/data/entities/platform.ts';
import { selectPlatformById } from '../../features/data/selectors/platforms.ts';
import { useAppSelector } from '../../features/data/store/hooks.ts';
import { Meta } from './Meta.tsx';

export type PlatformMetaProps = {
  platformId: PlatformEntity['id'];
};

export const PlatformMeta = memo(function PlatformMeta({ platformId }: PlatformMetaProps) {
  const { t } = useTranslation();
  const platform = useAppSelector(state => selectPlatformById(state, platformId));

  return (
    <Meta
      title={t('Meta-Platform-Title', { platform: platform.name })}
      description={
        platform.description || t('Meta-Platform-Description', { platform: platform.name })
      }
    />
  );
});
