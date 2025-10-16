import { memo } from 'react';
import { VaultIdImage } from '../../../../components/TokenImage/TokenImage.tsx';
import { punctuationWrap } from '../../../../helpers/string.ts';
import { useAppSelector } from '../../../data/store/hooks.ts';
import { type VaultEntity } from '../../../data/entities/vault.ts';
import { selectVaultIsBoostedForFilter } from '../../../data/selectors/filtered-vaults.ts';
import { selectVaultById } from '../../../data/selectors/vaults.ts';
import { SaveButton } from '../SaveButton/SaveButton.tsx';
import { ShareButton } from '../ShareButton/ShareButton.tsx';
import { ChainTag, PlatformTag } from './Tags.tsx';
import { styled } from '@repo/styles/jsx';
import { VaultTags } from '../../../../components/VaultIdentity/components/VaultTags/VaultTags.tsx';

export type VaultHeaderProps = {
  vaultId: VaultEntity['id'];
};
export const VaultHeader = memo(function VaultHeader({ vaultId }: VaultHeaderProps) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const isBoosted = useAppSelector(state => selectVaultIsBoostedForFilter(state, vaultId));

  return (
    <HeaderContent>
      <TitleAndLabelsHolder>
        <Title isBoosted={isBoosted}>
          {punctuationWrap(vault.names.list)}
          <VaultIdImage vaultId={vaultId} size={40} css={{ flexShrink: 0 }} />
        </Title>
        <LabelsHolder>
          <ChainTag chainId={vault.chainId} />
          <PlatformTag vaultId={vaultId} />
        </LabelsHolder>
      </TitleAndLabelsHolder>
      <VaultTagsAndShareHolder>
        <VaultTags vaultId={vaultId} hidePlatform={true} />
        <ShareHolder>
          {vault.status === 'active' ?
            <ShareButton hideText={true} vaultId={vaultId} mobileAlternative={true} />
          : null}
          <SaveButton vaultId={vaultId} />
        </ShareHolder>
      </VaultTagsAndShareHolder>
    </HeaderContent>
  );
});

const HeaderContent = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    md: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  },
});

const LabelsHolder = styled('div', {
  base: {
    display: 'flex',
    gap: '6px',
    order: 0,
    alignItems: 'center',
    md: {
      order: 1,
    },
  },
});

const TitleAndLabelsHolder = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    md: {
      flexDirection: 'row',
      gap: '4px',
    },
  },
});

const Title = styled('div', {
  base: {
    textStyle: 'h1',
    color: 'text.middle',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    flexWrap: 'wrap',
    whiteSpace: 'normal',
    overflowWrap: 'break-word',
    flex: '1 1 auto',
    minWidth: 0,
    maxWidth: '100%',
    order: 1,
    md: {
      order: 0,
    },
  },
  variants: {
    isBoosted: {
      true: {
        color: 'text.boosted',
      },
    },
  },
});

const VaultTagsAndShareHolder = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    height: '44px',
  },
});

const ShareHolder = styled('div', {
  base: {
    display: 'flex',
    columnGap: '8px',
    alignItems: 'center',
    sm: {
      paddingBlock: '2px',
    },
  },
});
