import React, { memo, useMemo } from 'react';
import type { VaultEntity } from '../../../data/entities/vault';
import { useAppSelector } from '../../../../store';
import {
  selectVaultHasAssetsWithRisks,
  selectVaultHasPlatformWithRisks,
} from '../../../data/selectors/vaults';
import { useTranslation } from 'react-i18next';
import { RISKS } from '../../../../config/risk';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';

const useStyles = makeStyles(styles);

interface NoSafuRisksProps {
  vaultId: VaultEntity['id'];
  isTitle: boolean;
  className?: string;
}

export const NoSafuRisks = memo<NoSafuRisksProps>(function NoSafuRisks({
  vaultId,
  isTitle,
  className,
}) {
  const vaultHasPlatformWithRisks = useAppSelector(state =>
    selectVaultHasPlatformWithRisks(state, vaultId)
  );

  const vaultHasAssetsWithRisks = useAppSelector(state =>
    selectVaultHasAssetsWithRisks(state, vaultId)
  );

  if (vaultHasPlatformWithRisks.risks) {
    const { platform } = vaultHasPlatformWithRisks;
    return (
      <WarningText
        className={className}
        isTitle={isTitle}
        type="Platform"
        risks={platform.risks}
        name={platform.name}
      />
    );
  }

  if (vaultHasAssetsWithRisks.risks) {
    const { token } = vaultHasAssetsWithRisks;
    return (
      <WarningText
        className={className}
        isTitle={isTitle}
        type="Token"
        risks={token.risks}
        name={token.id}
      />
    );
  }

  return null;
});

interface WarningTextProps {
  type: 'Token' | 'Platform';
  isTitle: boolean;
  risks: string[];
  name: string;
  className?: string;
}

const WarningText = memo<WarningTextProps>(function WarningText({
  type,
  isTitle,
  risks,
  name,
  className,
}) {
  const { t } = useTranslation();
  const classes = useStyles();

  const i18Key = useMemo(() => {
    const risk = `${type.toUpperCase()}_${risks[0]}`;

    if (RISKS[risk]) {
      const riskObject = RISKS[risk];
      return isTitle ? riskObject.title : riskObject.explanation;
    }
  }, [isTitle, risks, type]);

  return (
    <div className={clsx(classes.container, className)}>
      {t(i18Key, { [type.toLowerCase()]: name, ns: 'risks' })}
    </div>
  );
});
