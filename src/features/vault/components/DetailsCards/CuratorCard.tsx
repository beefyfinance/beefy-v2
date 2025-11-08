import { css } from '@repo/styles/css';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButtonLink } from '../../../../components/IconButtonLink/IconButtonLink.tsx';
import { useAppSelector } from '../../../data/store/hooks.ts';
import Link from '../../../../images/icons/mui/Link.svg?react';
import Twitter from '../../../../images/icons/mui/Twitter.svg?react';

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
import type { CuratorEntity } from '../../../data/entities/curator.ts';
import { selectCuratorById } from '../../../data/selectors/curators.ts';
import { TagTooltip, TagWithTooltip } from '../BridgeTag/BridgeTag.tsx';

function CuratorCardDisplay({ curator }: { curator: CuratorEntity }) {
  const { t } = useTranslation();

  return (
    <Container>
      <TitleContainer>
        <AssetIconSymbol>
          <AssetSymbol>{curator.name}</AssetSymbol>
        </AssetIconSymbol>
        <Links>
          {curator.website && (
            <IconButtonLink
              Icon={Link}
              text={t('Token-Site')}
              href={curator.website}
              textCss={styles.assetLinkText}
            />
          )}

          {curator.twitter && (
            <IconButtonLink
              Icon={Twitter}
              href={curator.twitter}
              text={t('Details-Platform-Link-Twitter')}
              textCss={styles.assetLinkText}
            />
          )}
        </Links>
        <AssetsBridgePrice>
          <TagWithTooltip
            tooltip={<TagTooltip content={t(`Details-Curator-Description-tooltip`)} />}
          >
            {t(`Curator`)}
          </TagWithTooltip>
        </AssetsBridgePrice>
      </TitleContainer>
      <Description className={css(!curator.description && styles.descriptionPending)}>
        {curator.description ? curator.description : t('Details-Curator-Description-pending')}
      </Description>
    </Container>
  );
}

function CuratorCardComponent({ curatorId }: { curatorId: CuratorEntity['id'] }) {
  const curator = useAppSelector(state => selectCuratorById(state, curatorId));
  return <CuratorCardDisplay curator={curator} />;
}

export const CuratorCard = memo(CuratorCardComponent);
