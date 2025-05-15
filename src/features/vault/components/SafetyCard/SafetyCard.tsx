import { css } from '@repo/styles/css';
import { Fragment, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Collapsable } from '../../../../components/Collapsable/Collapsable.tsx';
import { IconWithBasicTooltip } from '../../../../components/Tooltip/IconWithBasicTooltip.tsx';
import { SCORED_RISKS } from '../../../../config/risk.ts';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { useAppSelector } from '../../../data/store/hooks.ts';
import type { VaultEntity } from '../../../data/entities/vault.ts';
import { selectVaultById } from '../../../data/selectors/vaults.ts';
import { Card } from '../Card/Card.tsx';
import { CardContent } from '../Card/CardContent.tsx';
import { CardHeader } from '../Card/CardHeader.tsx';
import { NoSafuRisks } from '../NoSafuRisks/NoSafuRisks.tsx';
import down from './down.svg';
import { styles } from './styles.ts';
import up from './up.svg';

const useStyles = legacyMakeStyles(styles);

function SafetyCardComponent({ vaultId }: { vaultId: VaultEntity['id'] }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  return (
    <Card id="SafetyCard">
      <CardHeader>
        <div className={classes.safetyLabel}>{t('Safety-Score1')}</div>
      </CardHeader>
      <CardContent>
        <NoSafuRisks css={styles.warning} vaultId={vaultId} isTitle={false} />
        <div className={classes.riskList}>
          {vault.risks.map(risk => (
            <Fragment key={risk}>
              {SCORED_RISKS[risk] && (
                <div className={classes.riskRow}>
                  <div className={classes.infoContainer}>
                    {SCORED_RISKS[risk].score <= 0 ?
                      <img alt="Positive score" src={up} className={css(styles.arrow, styles.up)} />
                    : <img
                        alt="Negative score"
                        src={down}
                        className={css(styles.arrow, styles.down)}
                      />
                    }
                    <div>
                      <div className={classes.moreInfoContainer}>
                        <div className={classes.risk}>
                          {t(SCORED_RISKS[risk].title, { ns: 'risks' })}
                        </div>
                        <IconWithBasicTooltip
                          iconSize={16}
                          iconCss={styles.tooltipIcon}
                          title={t(SCORED_RISKS[risk].title, { ns: 'risks' })}
                          content={t(SCORED_RISKS[risk].explanation, { ns: 'risks' })}
                        />
                      </div>
                      <div className={classes.riskCategory}>
                        {t(SCORED_RISKS[risk].category, { ns: 'risks' })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Fragment>
          ))}
        </div>
        <Collapsable title={t('How-It-Works')} variant="light">
          <div className={classes.notes}>
            <p>{t('Safety-HigherSafer')}</p>
            <p>{t('Safety-BeefySecure')}</p>
          </div>
        </Collapsable>
      </CardContent>
    </Card>
  );
}

export const SafetyCard = memo(SafetyCardComponent);
