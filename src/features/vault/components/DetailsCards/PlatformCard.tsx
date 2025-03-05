import { useTranslation } from 'react-i18next';
import { selectIsPlatformsAvailable } from '../../../data/selectors/data-loader.ts';
import {
  AssetIconSymbol,
  AssetsBridgePrice,
  AssetSymbol,
  Container,
  Description,
  Links,
  styles,
  TitleContainer,
} from './styles.ts';
import { useAppSelector } from '../../../../store.ts';
import { IconButtonLink } from '../../../../components/IconButtonLink/IconButtonLink.tsx';
import Link from '../../../../images/icons/mui/Link.svg?react';
import Twitter from '../../../../images/icons/mui/Twitter.svg?react';
import DocsIcon from '../../../../images/icons/navigation/docs.svg?react';
import { memo } from 'react';
import type { PlatformEntity } from '../../../data/entities/platform.ts';
import { selectPlatformById } from '../../../data/selectors/platforms.ts';
import { TagTooltip, TagWithTooltip } from '../BridgeTag/BridgeTag.tsx';
import { getPlatformSrc, platformAssetExists } from '../../../../helpers/platformsSrc.ts';
import { css } from '@repo/styles/css';

function PlatformCardDisplay({ platform }: { platform: PlatformEntity }) {
  const { t } = useTranslation();

  return (
    <Container>
      <TitleContainer>
        <AssetIconSymbol>
          <PlatformImage platformId={platform.id} />
          <AssetSymbol>{platform.name}</AssetSymbol>
        </AssetIconSymbol>
        <Links>
          {platform.website && (
            <IconButtonLink
              Icon={Link}
              text={t('Token-Site')}
              href={platform.website}
              textCss={styles.assetLinkText}
            />
          )}
          {platform.documentation && (
            <IconButtonLink
              Icon={DocsIcon}
              href={platform.documentation}
              text={t('Token-Docs')}
              textCss={styles.assetLinkText}
            />
          )}
          {platform.twitter && (
            <IconButtonLink
              Icon={Twitter}
              href={`https://x.com/${platform.twitter}`}
              text={t('Details-Platform-Link-Twitter')}
              textCss={styles.assetLinkText}
            />
          )}
        </Links>
        <AssetsBridgePrice>
          {platform.type ? (
            <TagWithTooltip
              tooltip={
                <TagTooltip content={t(`Details-Platform-Type-Description-${platform.type}`)} />
              }
            >
              {t(`Details-Platform-Type-${platform.type}`)}
            </TagWithTooltip>
          ) : null}
        </AssetsBridgePrice>
      </TitleContainer>
      <Description className={css(!platform.description && styles.descriptionPending)}>
        {platform.description ? platform.description : t('Details-Platform-Description-pending')}
      </Description>
    </Container>
  );
}

function PlatformCardComponent({ platformId }: { platformId: PlatformEntity['id'] }) {
  const platformsLoaded = useAppSelector(selectIsPlatformsAvailable);
  const platform = useAppSelector(state =>
    platformsLoaded ? selectPlatformById(state, platformId) : null
  );

  if (!platformsLoaded || !platform) {
    return <></>;
  }

  return <PlatformCardDisplay platform={platform} />;
}

export const PlatformCard = memo(PlatformCardComponent);

const PlatformImage = memo(function PlatformImage({ platformId }: { platformId: string }) {
  return (
    <>
      {platformAssetExists(platformId) ? (
        <img
          src={getPlatformSrc(platformId)}
          alt={platformId}
          style={{ height: '24px', width: '24px' }}
        />
      ) : (
        <></>
      )}
    </>
  );
});
