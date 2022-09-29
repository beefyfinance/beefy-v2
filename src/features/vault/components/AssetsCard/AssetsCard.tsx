import { makeStyles } from '@material-ui/core';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Collapsable } from '../../../../components/Collapsable';
import { useAppSelector } from '../../../../store';
import { VaultEntity } from '../../../data/entities/vault';
import { selectVaultById } from '../../../data/selectors/vaults';
import { styles } from './styles';
import { TokenCard } from '../TokenCard';

const useStyles = makeStyles(styles);

interface AssetsCardProps {
  vaultId: VaultEntity['id'];
}

export const AssetsCard = memo<AssetsCardProps>(function ({ vaultId }) {
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <Collapsable openByDefault={true} titleClassName={classes.title} title={t('Asset-Detail')}>
        <div className={classes.cards}>
          {vault.assetIds.map(tokenId => (
            <TokenCard key={tokenId} chainId={vault.chainId} tokenId={tokenId} />
          ))}
        </div>
      </Collapsable>
    </div>
  );
});
