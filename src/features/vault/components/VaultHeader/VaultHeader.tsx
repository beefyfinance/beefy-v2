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

  // Split vault name to get the last part (after last space, / or -)
  const vaultName = vault.names.list;

  // Find the last breakable character (space, /, or -)
  const breakChars = [' ', '/', '-'];
  let lastBreakIndex = -1;
  for (let i = vaultName.length - 1; i >= 0; i--) {
    if (breakChars.includes(vaultName[i])) {
      lastBreakIndex = i;
      break;
    }
  }

  const beforeLastToken = lastBreakIndex >= 0 ? vaultName.substring(0, lastBreakIndex + 1) : '';
  const lastToken = lastBreakIndex >= 0 ? vaultName.substring(lastBreakIndex + 1) : vaultName;

  return (
    <HeaderContent>
      <TitleAndLabelsHolder>
        <Title isBoosted={isBoosted}>
          {beforeLastToken && <span>{punctuationWrap(beforeLastToken)}</span>}
          <LastTokenWithImage>
            {punctuationWrap(lastToken)}
            <VaultImageHolder css={{ flexShrink: 0 }}>
              <VaultIdImage vaultId={vaultId} size={36} />
            </VaultImageHolder>
          </LastTokenWithImage>
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

const VaultImageHolder = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
  },
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
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '4px',
    flex: '1 1 auto',
    minWidth: 0,
    maxWidth: '100%',
    order: 1,
    md: {
      order: 0,
      display: 'inline-flex',
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

const LastTokenWithImage = styled('span', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    whiteSpace: 'nowrap',
  },
});

const VaultTagsAndShareHolder = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    height: '40px',
    sm: {
      height: '44px',
    },
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
