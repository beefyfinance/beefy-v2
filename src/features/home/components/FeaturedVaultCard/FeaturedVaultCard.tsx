import { css, type CssStyles } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';
import { memo } from 'react';
import { Link } from 'react-router';
import { ChainIcon } from '../../../../components/ChainIcon/ChainIcon.tsx';
import { Marquee } from '../../../../components/Marquee/Marquee.tsx';
import { VaultIdImage } from '../../../../components/TokenImage/TokenImage.tsx';
import { VaultTags } from '../../../../components/VaultIdentity/components/VaultTags/VaultTags.tsx';
import { VaultApyStat } from '../../../../components/VaultStats/VaultApyStat.tsx';
import { VaultTvlStat } from '../../../../components/VaultStats/VaultTvlStat.tsx';
import { punctuationWrap } from '../../../../helpers/string.ts';
import { FeaturedVaultApyLabel } from './FeaturedVaultApyLabel.tsx';
import type { VaultEntity } from '../../../data/entities/vault.ts';
import { selectChainById } from '../../../data/selectors/chains.ts';
import { selectVaultById } from '../../../data/selectors/vaults.ts';
import { useAppSelector } from '../../../data/store/hooks.ts';

export type FeaturedVaultCardProps = {
  vaultId: VaultEntity['id'];
  showChainBadge?: boolean;
  css?: CssStyles;
};

export const FeaturedVaultCard = memo(function FeaturedVaultCard({
  vaultId,
  showChainBadge = true,
  css: cssProp,
}: FeaturedVaultCardProps) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const chain = useAppSelector(state => selectChainById(state, vault.chainId));
  const isGradient = chain.brand?.icon === 'gradient';

  const imageSize = vault.assetIds.length === 1 ? 32 : 40;

  return (
    <Card to={`/vault/${vaultId}`} css={cssProp}>
      {showChainBadge && (
        <ChainBadge
          className={css(
            { colorPalette: `network.${vault.chainId}` },
            isGradient && chainBadgeGradient
          )}
        >
          <ChainIcon chainId={vault.chainId} size={20} />
        </ChainBadge>
      )}

      <Identity>
        <HeadTop>
          <Marquee className={nameContentClass}>{punctuationWrap(vault.names.list)}</Marquee>
          <HeadIcon>
            <VaultIdImage vaultId={vaultId} size={imageSize} />
          </HeadIcon>
        </HeadTop>
        <Marquee className={tagsContentClass}>
          <VaultTags vaultId={vaultId} />
        </Marquee>
      </Identity>
      <Stats>
        <StatColumn>
          <FeaturedVaultApyLabel />
          <VaultApyStat vaultId={vaultId} type="yearly" showLabel={false} align="left" />
        </StatColumn>
        <VaultTvlStat vaultId={vaultId} showLabel align="left" hideSubValue />
      </Stats>
    </Card>
  );
});

const Card = styled(Link, {
  base: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    rowGap: '16px',
    width: '100%',
    minWidth: '0',
    paddingBlock: '24px 20px',
    paddingInline: '24px',
    overflow: 'hidden',
    textDecoration: 'none',
    color: 'text.middle',
    background: 'background.cardBody',
  },
});

// Content styling passed into the marquees (Marquee owns only structure/animation).
const nameContentClass = css({ textStyle: 'h3', color: 'text.light' });
const tagsContentClass = css({
  '& > *': {
    marginTop: '0',
    columnGap: '4px',
    rowGap: '4px',
  },
});

const ChainBadge = styled('div', {
  base: {
    position: 'absolute',
    top: '0px',
    left: '0px',
    lineHeight: '0',
    backgroundColor: 'colorPalette.primary',
    borderBottomRightRadius: '12px',
    padding: '2px',
  },
});

const chainBadgeGradient = css.raw({
  backgroundImage:
    'linear-gradient(90deg, var(--colors-color-palette-primary) 0%, var(--colors-color-palette-secondary, var(--colors-color-palette-primary)) 100%)',
});

const Identity = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: '8px',
    minWidth: '0',
  },
});

const HeadTop = styled('div', {
  base: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    columnGap: '8px',
    minWidth: '0',
    paddingRight: '48px',
  },
});

const HeadIcon = styled('div', {
  base: {
    position: 'absolute',
    right: '0',
    top: '50%',
    transform: 'translateY(-50%)',
    lineHeight: '0',
    pointerEvents: 'none',
  },
});

const Stats = styled('div', {
  base: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
    columnGap: '16px',
    flexShrink: 0,
    '& > *': {
      rowGap: '2px',
    },
  },
});

const StatColumn = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px 6px',
    minWidth: '0',
    alignItems: 'flex-start',
    textAlign: 'left',
  },
});
