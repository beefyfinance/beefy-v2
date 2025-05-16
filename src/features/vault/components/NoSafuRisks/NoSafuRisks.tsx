import { memo, useCallback, useMemo } from 'react';
import type { VaultEntity } from '../../../data/entities/vault.ts';
import { Trans, useTranslation } from 'react-i18next';
import { UNSCORED_RISKS } from '../../../../config/risk.ts';
import { styles } from './styles.ts';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { css, type CssStyles } from '@repo/styles/css';
import { useVaultHasRisks } from './hooks.ts';

const useStyles = legacyMakeStyles(styles);

interface NoSafuRisksProps {
  vaultId: VaultEntity['id'];
  isTitle: boolean;
  css?: CssStyles;
}

export const NoSafuRisks = memo(function NoSafuRisks({
  vaultId,
  isTitle,
  css: cssProp,
}: NoSafuRisksProps) {
  const { vaultHasRisks, values, risk } = useVaultHasRisks(vaultId);

  if (vaultHasRisks && values && risk) {
    return <WarningText css={cssProp} isTitle={isTitle} values={values} risk={risk} />;
  }

  return null;
});

interface WarningTextProps {
  isTitle: boolean;
  risk: string;
  values: Record<string, string>;
  css?: CssStyles;
}

const WarningText = memo(function WarningText({
  isTitle,
  risk,
  values,
  css: cssProp,
}: WarningTextProps) {
  const { t } = useTranslation('risks');
  const classes = useStyles();

  const i18Key = useMemo(() => {
    if (UNSCORED_RISKS[risk]) {
      const riskObject = UNSCORED_RISKS[risk];
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
    <div className={css(styles.container, cssProp)}>
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
