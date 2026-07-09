import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getApyLabelsTypeForVault } from '../../../../../helpers/apy.ts';
import { explorerAddressUrl } from '../../../../../helpers/url.ts';
import { useAppSelector } from '../../../../data/store/hooks.ts';
import { shouldVaultShowInterest, type VaultEntity } from '../../../../data/entities/vault.ts';
import { selectVaultTotalApyOrUndefined } from '../../../../data/selectors/apy.ts';
import { selectCurrentBoostByVaultIdOrUndefined } from '../../../../data/selectors/boosts.ts';
import { selectChainById } from '../../../../data/selectors/chains.ts';
import { selectErc4626VaultById } from '../../../../data/selectors/vaults.ts';
import { CardTitle } from '../../Card/CardTitle.tsx';
import { ApyDetails } from '../ApyDetails/ApyDetails.tsx';
import { Erc4626Description } from '../Description/Erc4626Description.tsx';
import { ExplainerCard } from '../ExplainerCard/ExplainerCard.tsx';

type Erc4626ExplainerProps = {
  vaultId: VaultEntity['id'];
};

const Erc4626Explainer = memo(function Erc4626Explainer({ vaultId }: Erc4626ExplainerProps) {
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectErc4626VaultById(state, vaultId));
  const boost = useAppSelector(state => selectCurrentBoostByVaultIdOrUndefined(state, vaultId));
  const chain = useAppSelector(state => selectChainById(state, vault.chainId));
  const apys = useAppSelector(state => selectVaultTotalApyOrUndefined(state, vaultId));
  const showApy = apys && shouldVaultShowInterest(vault);

  const links = useMemo(() => {
    const urls: {
      link: string;
      label: string;
    }[] = [];
    urls.push({
      link: explorerAddressUrl(chain, vault.contractAddress),
      label: t('Strat-VaultContract'),
    });
    if (boost) {
      urls.push({
        link: explorerAddressUrl(chain, boost.contractAddress),
        label: t('Boost-Contract'),
      });
    }
    return urls;
  }, [boost, chain, t, vault.contractAddress]);

  return (
    <ExplainerCard
      title={<CardTitle>{t('Vault-Strategy')}</CardTitle>}
      links={links}
      description={<Erc4626Description vaultId={vaultId} />}
      details={
        showApy ?
          <ApyDetails type={getApyLabelsTypeForVault(vault, apys.totalType)} values={apys} />
        : null
      }
    />
  );
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default Erc4626Explainer;
