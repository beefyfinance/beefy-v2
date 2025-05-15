import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getApyLabelsTypeForVault } from '../../../../../helpers/apy.ts';
import { explorerAddressUrl } from '../../../../../helpers/url.ts';
import { useAppSelector } from '../../../../data/store/hooks.ts';
import { shouldVaultShowInterest, type VaultEntity } from '../../../../data/entities/vault.ts';
import { selectVaultTotalApyOrUndefined } from '../../../../data/selectors/apy.ts';
import { selectCurrentBoostByVaultIdOrUndefined } from '../../../../data/selectors/boosts.ts';
import { selectChainById } from '../../../../data/selectors/chains.ts';
import {
  selectStandardVaultById,
  selectVaultStrategyAddressOrUndefined,
} from '../../../../data/selectors/vaults.ts';
import { CardTitle } from '../../Card/CardTitle.tsx';
import { ApyDetails } from '../ApyDetails/ApyDetails.tsx';
import { StandardDescription } from '../Description/StandardDescription.tsx';
import { ExplainerCard } from '../ExplainerCard/ExplainerCard.tsx';
import { LendingOracle } from '../LendingOracle/LendingOracle.tsx';

type StandardExplainerProps = {
  vaultId: VaultEntity['id'];
  underlyingId?: VaultEntity['id'];
};

const StandardExplainer = memo(function StandardExplainer({ vaultId }: StandardExplainerProps) {
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectStandardVaultById(state, vaultId));
  const boost = useAppSelector(state => selectCurrentBoostByVaultIdOrUndefined(state, vaultId));
  const chain = useAppSelector(state => selectChainById(state, vault.chainId));
  const apys = useAppSelector(state => selectVaultTotalApyOrUndefined(state, vaultId));
  const strategyAddress = useAppSelector(state =>
    selectVaultStrategyAddressOrUndefined(state, vaultId)
  );
  const showApy = apys && shouldVaultShowInterest(vault);
  const showLendingOracle = !!vault.lendingOracle;

  const links = useMemo(() => {
    const urls: {
      link: string;
      label: string;
    }[] = [];
    if (strategyAddress) {
      urls.push({
        link: explorerAddressUrl(chain, strategyAddress),
        label: t('Strat-Contract'),
      });
    }
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
  }, [boost, chain, strategyAddress, t, vault.contractAddress]);

  return (
    <ExplainerCard
      title={<CardTitle>{t('Vault-Strategy')}</CardTitle>}
      links={links}
      description={<StandardDescription vaultId={vaultId} />}
      details={
        <>
          {showApy ?
            <ApyDetails type={getApyLabelsTypeForVault(vault, apys.totalType)} values={apys} />
          : null}
          {showLendingOracle ?
            <LendingOracle vaultId={vault.id} />
          : null}
        </>
      }
    />
  );
});

// eslint-disable-next-line no-restricted-syntax -- default export required for React.lazy()
export default StandardExplainer;
