import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { LinkButton } from '../../../../../components/LinkButton';
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

type CowcentratedExplainerProps = {
  vaultId: VaultCowcentratedLike['id'];
};

export const CowcentratedExplainer = memo<CowcentratedExplainerProps>(
  function CowcentratedExplainer({ vaultId }) {
    const { t } = useTranslation();
    const vault = useAppSelector(state => selectCowcentratedLikeVaultById(state, vaultId));
    const chain = useAppSelector(state => selectChainById(state, vault.chainId));
    const apys = useAppSelector(state => selectVaultTotalApy(state, vaultId));
    const strategyAddress = useAppSelector(state =>
      selectVaultStrategyAddressOrUndefined(state, vault.cowcentratedId)
    );
    const showApy = apys && apys.totalApy > 0 && shouldVaultShowInterest(vault);

    return (
      <ExplainerCard
        title={<CardTitle title={t('Vault-Strategy')} />}
        actions={
          <>
            {strategyAddress ? (
              <LinkButton
                href={explorerAddressUrl(chain, strategyAddress)}
                text={t('Strat-Contract')}
              />
            ) : null}
            <LinkButton
              href={explorerAddressUrl(
                chain,
                getCowcentratedAddressFromCowcentratedLikeVault(vault)
              )}
              text={t('Strat-CLMContract')}
            />
            {isCowcentratedGovVault(vault) ? (
              <LinkButton
                href={explorerAddressUrl(chain, vault.contractAddress)}
                text={t('Strat-PoolContract')}
              />
            ) : null}
            {isCowcentratedStandardVault(vault) ? (
              <LinkButton
                href={explorerAddressUrl(chain, vault.contractAddress)}
                text={t('Strat-VaultContract')}
              />
            ) : null}
          </>
        }
        description={<CowcentratedLikeDescription vaultId={vaultId} />}
        details={
          showApy ? <ApyDetails type={getApyLabelsTypeForVault(vault)} values={apys} /> : undefined
        }
      />
    );
  }
);
