import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CardTitle } from '../../Card';
import { selectVaultTotalApy } from '../../../../data/selectors/apy';
import {
  isCowcentratedGovVault,
  isCowcentratedStandardVault,
  shouldVaultShowInterest,
  type VaultCowcentratedLike,
} from '../../../../data/entities/vault';
import {
  selectCowcentratedLikeVaultById,
  selectVaultStrategyAddressOrUndefined,
} from '../../../../data/selectors/vaults';
import { selectChainById } from '../../../../data/selectors/chains';
import { useAppSelector } from '../../../../../store';
import { explorerAddressUrl } from '../../../../../helpers/url';
import { ApyDetails } from '../ApyDetails/ApyDetails';
import { ExplainerCard } from '../ExplainerCard/ExplainerCard';
import { CowcentratedLikeDescription } from '../Description/CowcentratedLikeDescription';
import { getCowcentratedAddressFromCowcentratedLikeVault } from '../../../../data/utils/vault-utils';
import { getApyLabelsTypeForVault } from '../../../../../helpers/apy';
import { selectCurrentBoostByVaultIdOrUndefined } from '../../../../data/selectors/boosts';

type CowcentratedExplainerProps = {
  vaultId: VaultCowcentratedLike['id'];
};

export const CowcentratedExplainer = memo<CowcentratedExplainerProps>(
  function CowcentratedExplainer({ vaultId }) {
    const { t } = useTranslation();
    const vault = useAppSelector(state => selectCowcentratedLikeVaultById(state, vaultId));
    const boost = useAppSelector(state => selectCurrentBoostByVaultIdOrUndefined(state, vaultId));
    const chain = useAppSelector(state => selectChainById(state, vault.chainId));
    const apys = useAppSelector(state => selectVaultTotalApy(state, vaultId));
    const strategyAddress = useAppSelector(state =>
      selectVaultStrategyAddressOrUndefined(state, vault.cowcentratedIds.clm)
    );
    const clmVaultStrategyAddress = useAppSelector(state =>
      selectVaultStrategyAddressOrUndefined(state, vaultId)
    );

    const showApy = apys && apys.totalApy > 0 && shouldVaultShowInterest(vault);

    const links = useMemo(() => {
      const urls = [
        {
          link: explorerAddressUrl(chain, getCowcentratedAddressFromCowcentratedLikeVault(vault)),
          label: t('Strat-CLMContract'),
        },
      ];

      if (strategyAddress) {
        urls.push({
          link: explorerAddressUrl(chain, strategyAddress),
          label: t('Strat-CLM-Strategy'),
        });
      }

      if (isCowcentratedGovVault(vault)) {
        urls.push({
          link: explorerAddressUrl(chain, vault.contractAddress),
          label: t('Strat-CLMPoolContract'),
        });
      }
      if (isCowcentratedStandardVault(vault)) {
        urls.push({
          link: explorerAddressUrl(chain, vault.contractAddress),
          label: t('Strat-VaultContract'),
        });
      }
      if (clmVaultStrategyAddress && isCowcentratedStandardVault(vault)) {
        urls.push({
          link: explorerAddressUrl(chain, clmVaultStrategyAddress),
          label: t('Strat-CLM-Strategy-Vault'),
        });
      }

      if (boost) {
        urls.push({
          link: explorerAddressUrl(chain, boost.contractAddress),
          label: t('Boost-Contract'),
        });
      }
      return urls;
    }, [boost, chain, clmVaultStrategyAddress, strategyAddress, t, vault]);

    return (
      <ExplainerCard
        title={<CardTitle title={t('Vault-Strategy')} />}
        links={links}
        description={<CowcentratedLikeDescription vaultId={vaultId} />}
        details={
          showApy ? (
            <ApyDetails type={getApyLabelsTypeForVault(vault, apys.totalType)} values={apys} />
          ) : undefined
        }
      />
    );
  }
);
