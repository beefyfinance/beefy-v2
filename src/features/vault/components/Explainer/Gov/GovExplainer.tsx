import { useTranslation } from 'react-i18next';
import { CardTitle } from '../../Card';
import type { VaultGov } from '../../../../data/entities/vault';
import { selectGovVaultById } from '../../../../data/selectors/vaults';
import { useAppSelector } from '../../../../../store';
import { LinkButton } from '../../../../../components/LinkButton';
import { selectChainById } from '../../../../data/selectors/chains';
import { explorerAddressUrl } from '../../../../../helpers/url';
import { GovDescription } from '../Description/GovDescription';
import { memo } from 'react';
import ExplainerCard from '../ExplainerCard';

type GovExplainerProps = {
  vaultId: VaultGov['id'];
};

export const GovExplainer = memo<GovExplainerProps>(function GovExplainer({ vaultId }) {
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectGovVaultById(state, vaultId)) as VaultGov;
  const chain = useAppSelector(state => selectChainById(state, vault.chainId));

  return (
    <ExplainerCard
      title={<CardTitle title={t('Gov-Pool')} />}
      actions={
        <LinkButton
          href={explorerAddressUrl(chain, vault.contractAddress)}
          text={t('Strat-PoolContract')}
        />
      }
      description={<GovDescription vaultId={vaultId} />}
    />
  );
});
