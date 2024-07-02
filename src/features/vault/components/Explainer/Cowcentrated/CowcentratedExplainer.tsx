import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { LinkButton } from '../../../../../components/LinkButton';
import { CardTitle } from '../../Card';
import { selectVaultTotalApy } from '../../../../data/selectors/apy';
import {
  shouldVaultShowInterest,
  type VaultCowcentrated,
  type VaultGov,
} from '../../../../data/entities/vault';
import {
  selectCowcentratedVaultById,
  selectGovVaultById,
  selectVaultStrategyAddressOrUndefined,
} from '../../../../data/selectors/vaults';
import { selectChainById } from '../../../../data/selectors/chains';
import { useAppSelector } from '../../../../../store';
import { explorerAddressUrl } from '../../../../../helpers/url';
import { ApyDetails } from '../ApyDetails/ApyDetails';
import { ExplainerCard } from '../ExplainerCard/ExplainerCard';
import { CowcentratedDescription } from '../Description/CowcentratedDescription';

type CowcentratedExplainerProps = {
  vaultId: VaultCowcentrated['id'];
  poolId?: VaultGov['id'];
};

export const CowcentratedExplainer = memo<CowcentratedExplainerProps>(
  function CowcentratedExplainer({ vaultId, poolId }) {
    const { t } = useTranslation();
    const vault = useAppSelector(state => selectCowcentratedVaultById(state, vaultId));
    const pool = useAppSelector(state => (poolId ? selectGovVaultById(state, poolId) : undefined));
    const chain = useAppSelector(state => selectChainById(state, vault.chainId));
    const apys = useAppSelector(state => selectVaultTotalApy(state, poolId ?? vaultId));
    const strategyAddress = useAppSelector(state =>
      selectVaultStrategyAddressOrUndefined(state, vaultId)
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
              href={explorerAddressUrl(chain, vault.contractAddress)}
              text={t('Strat-CLMContract')}
            />
            {pool ? (
              <LinkButton
                href={explorerAddressUrl(chain, pool.contractAddress)}
                text={t('Strat-PoolContract')}
              />
            ) : null}
          </>
        }
        description={
          <CowcentratedDescription vaultId={vaultId} poolId={pool ? pool.id : undefined} />
        }
        details={showApy ? <ApyDetails type={vault.type} values={apys} /> : undefined}
      />
    );
  }
);
