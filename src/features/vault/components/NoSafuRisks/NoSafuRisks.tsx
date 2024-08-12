import { memo, useCallback, useMemo } from 'react';
import type { VaultEntity } from '../../../data/entities/vault';
import { Trans, useTranslation } from 'react-i18next';
import { RISKS } from '../../../../config/risk';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { useVaultHasRisks } from './hooks';

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
  const { vaultHasRisks, values, risk } = useVaultHasRisks(vaultId);

  if (vaultHasRisks && values && risk) {
    return <WarningText className={className} isTitle={isTitle} values={values} risk={risk} />;
  }

  return null;
});

interface WarningTextProps {
  isTitle: boolean;
  risk: string;
  values: Record<string, string>;
  className?: string;
}

const WarningText = memo<WarningTextProps>(function WarningText({
  isTitle,
  risk,
  values,
  className,
}) {
  const { t } = useTranslation('risks');
  const classes = useStyles();

  const i18Key = useMemo(() => {
    if (RISKS[risk]) {
      const riskObject = RISKS[risk];
      return isTitle ? riskObject.title : riskObject.explanation;
    }
  }, [isTitle, risk]);

  const handleClickScroll = useCallback(() => {
    const element = document.getElementById('SafetyCard');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <div className={clsx(classes.container, className)}>
      <Trans
        t={t}
        i18nKey={i18Key}
        values={values}
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
