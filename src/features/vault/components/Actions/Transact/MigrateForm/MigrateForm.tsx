import { memo } from 'react';
import { css } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import type { VaultEntity } from '../../../../../data/entities/vault.ts';
import { selectTransactVaultId } from '../../../../../data/selectors/transact.ts';
import { selectVaultReplacementMigration } from '../../../../../data/selectors/vaults.ts';
import { FeaturedVaultCard } from '../../../../../home/components/FeaturedVaultCard/FeaturedVaultCard.tsx';
import { MigrateActions } from '../MigrateActions/MigrateActions.tsx';
import { MigrateNotice, MigrateZapNotice } from './MigrateTexts.tsx';

const MigrateFormLoader = memo(function MigrateFormLoader() {
  const vaultId = useAppSelector(selectTransactVaultId);
  const migration = useAppSelector(state => selectVaultReplacementMigration(state, vaultId));

  if (!migration) {
    return null;
  }

  return <MigrateForm oldVaultId={migration.oldVaultId} newVaultId={migration.newVaultId} />;
});

type MigrateFormProps = {
  oldVaultId: VaultEntity['id'];
  newVaultId: VaultEntity['id'];
};

const MigrateForm = memo(function MigrateForm({ oldVaultId, newVaultId }: MigrateFormProps) {
  return (
    <>
      <Container>
        <Section>
          <MigrateNotice oldVaultId={oldVaultId} />
        </Section>

        <Section background="light">
          <FeaturedVaultCard
            vaultId={newVaultId}
            showChainBadge={false}
            css={css.raw({
              backgroundColor: 'background.content.light',
              paddingBlock: '8px',
              paddingInline: '0px',
            })}
          />
        </Section>

        <Section>
          <MigrateZapNotice />
          <MigrateActions oldVaultId={oldVaultId} newVaultId={newVaultId} />
        </Section>
      </Container>
    </>
  );
});

const Container = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    paddingBlock: '16px',
    gap: '24px',
    sm: {
      paddingBlock: '20px 24px',
    },
  },
});

const Section = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    paddingInline: '16px',
    sm: {
      paddingInline: '24px',
    },
  },
  variants: {
    background: {
      light: {
        backgroundColor: 'background.content.light',
      },
    },
  },
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default MigrateFormLoader;
