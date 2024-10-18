import { useTranslation } from 'react-i18next';
import { CardTitle } from '../../Card';
import type { VaultGov } from '../../../../data/entities/vault';
import { selectGovVaultById } from '../../../../data/selectors/vaults';
import { useAppSelector } from '../../../../../store';
import { selectChainById } from '../../../../data/selectors/chains';
import { explorerAddressUrl } from '../../../../../helpers/url';
import { GovDescription } from '../Description/GovDescription';
import { memo, useMemo } from 'react';
import ExplainerCard from '../ExplainerCard';

type GovExplainerProps = {
  vaultId: VaultGov['id'];
};

export const GovExplainer = memo<GovExplainerProps>(function GovExplainer({ vaultId }) {
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectGovVaultById(state, vaultId)) as VaultGov;
  const chain = useAppSelector(state => selectChainById(state, vault.chainId));

  const links = useMemo(() => {
    return [
      { link: explorerAddressUrl(chain, vault.contractAddress), label: t('Strat-PoolContract') },
    ];
  }, [chain, t, vault.contractAddress]);

  return (
    <ExplainerCard
      title={<CardTitle title={t('Gov-Pool')} />}
      links={links}
      description={<GovDescription vaultId={vaultId} />}
    />
  );
});
