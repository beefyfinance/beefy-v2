import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CardTitle } from '../../Card';
import { StandardDescription } from '../Description/StandardDescription';
import { selectVaultTotalApyOrUndefined } from '../../../../data/selectors/apy';
import { shouldVaultShowInterest, type VaultEntity } from '../../../../data/entities/vault';
import {
  selectStandardVaultById,
  selectVaultStrategyAddressOrUndefined,
} from '../../../../data/selectors/vaults';
import { selectChainById } from '../../../../data/selectors/chains';
import { useAppSelector } from '../../../../../store';
import { explorerAddressUrl } from '../../../../../helpers/url';
import { ApyDetails } from '../ApyDetails/ApyDetails';
import { LendingOracle } from '../LendingOracle/LendingOracle';
import { ExplainerCard } from '../ExplainerCard/ExplainerCard';
import { getApyLabelsTypeForVault } from '../../../../../helpers/apy';
import { selectCurrentBoostByVaultIdOrUndefined } from '../../../../data/selectors/boosts';

type StandardExplainerProps = {
  vaultId: VaultEntity['id'];
  underlyingId?: VaultEntity['id'];
};

export const StandardExplainer = memo<StandardExplainerProps>(function StandardExplainer({
  vaultId,
}) {
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
    const urls: { link: string; label: string }[] = [];
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
      title={<CardTitle title={t('Vault-Strategy')} />}
      links={links}
      description={<StandardDescription vaultId={vaultId} />}
      details={
        <>
          {showApy ? (
            <ApyDetails type={getApyLabelsTypeForVault(vault, apys.totalType)} values={apys} />
          ) : null}
          {showLendingOracle ? <LendingOracle vaultId={vault.id} /> : null}
        </>
      }
    />
  );
});
