import React, { memo, useCallback, useMemo } from 'react';
import type { VaultEntity } from '../../../data/entities/vault';
import { useAppSelector } from '../../../../store';
import {
  selectVaultHasAssetsWithRisks,
  selectVaultHasPlatformWithRisks,
} from '../../../data/selectors/vaults';
import { Trans, useTranslation } from 'react-i18next';
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

  console.log(vaultHasAssetsWithRisks);

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
  const { t } = useTranslation('risks');
  const classes = useStyles();

  const i18Key = useMemo(() => {
    const risk = `${type.toUpperCase()}_${risks[0]}`;

    if (RISKS[risk]) {
      const riskObject = RISKS[risk];
      return isTitle ? riskObject.title : riskObject.explanation;
    }
  }, [isTitle, risks, type]);

  const handleClickScroll = useCallback(() => {
    const element = document.getElementById('SafetyCard');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <div className={clsx(classes.container, className, { [classes.hover]: isTitle })}>
      <Trans
        t={t}
        i18nKey={i18Key}
        name="risks"
        values={{ [type.toLowerCase()]: name }}
        components={{
          Link: (
            <a
              href={'https://docs.beefy.finance/safu-protocol/beefy-safu-practices'}
              className={classes.link}
              target={'_blank'}
              rel={'noopener'}
            />
          ),
          DetailsBtn: <span className={classes.link} onClick={handleClickScroll} />,
        }}
      />
    </div>
  );
});
