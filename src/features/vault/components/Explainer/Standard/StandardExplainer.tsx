import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { LinkButton } from '../../../../../components/LinkButton';
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

type StandardExplainerProps = {
  vaultId: VaultEntity['id'];
  underlyingId?: VaultEntity['id'];
};

export const StandardExplainer = memo<StandardExplainerProps>(function StandardExplainer({
  vaultId,
}) {
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectStandardVaultById(state, vaultId));
  const chain = useAppSelector(state => selectChainById(state, vault.chainId));
  const apys = useAppSelector(state => selectVaultTotalApyOrUndefined(state, vaultId));
  const strategyAddress = useAppSelector(state =>
    selectVaultStrategyAddressOrUndefined(state, vaultId)
  );
  const showApy = apys && shouldVaultShowInterest(vault);
  const showLendingOracle = !!vault.lendingOracle;

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
            text={t('Strat-ContractVault')}
          />
        </>
      }
      description={<StandardDescription vaultId={vaultId} />}
      details={
        <>
          {showApy ? <ApyDetails type={getApyLabelsTypeForVault(vault)} values={apys} /> : null}
          {showLendingOracle ? <LendingOracle vaultId={vault.id} /> : null}
        </>
      }
    />
  );
});
