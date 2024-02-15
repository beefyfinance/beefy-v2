import { makeStyles } from '@material-ui/core';
import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Popover } from '../../../../components/Popover';
import { RISKS } from '../../../../config/risk';
import { Card } from '../Card';
import { CardHeader } from '../Card/CardHeader';
import { CardContent } from '../Card/CardContent';
import { styles } from './styles';
import up from './up.svg';
import down from './down.svg';
import { selectVaultById } from '../../../data/selectors/vaults';
import type { VaultEntity } from '../../../data/entities/vault';
import { useAppSelector } from '../../../../store';
import { Collapsable } from '../../../../components/Collapsable';
import clsx from 'clsx';
import { NoSafuRisks } from '../NoSafuRisks';

const useStyles = makeStyles(styles);

function SafetyCardComponent({ vaultId }: { vaultId: VaultEntity['id'] }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  return (
    <Card id="SafetyCard">
      <CardHeader className={classes.header}>
        <div className={classes.safetyLabel}>{t('Safety-Score1')}</div>
      </CardHeader>
      <CardContent>
        <NoSafuRisks className={classes.warning} vaultId={vaultId} isTitle={false} />
        <div className={classes.riskList}>
          {vault.risks.map(risk => (
            <Fragment key={risk}>
              {RISKS[risk] && (
                <div className={classes.riskRow}>
                  <div className={classes.infoContainer}>
                    {RISKS[risk].score <= 0 ? (
                      <img
                        alt="Positive score"
                        src={up}
                        className={clsx(classes.arrow, classes.up)}
                      />
                    ) : (
                      <img
                        alt="Negative score"
                        src={down}
                        className={clsx(classes.arrow, classes.down)}
                      />
                    )}
                    <div>
                      <div className={classes.moreInfoContainer}>
                        <div className={classes.risk}>{t(RISKS[risk].title, { ns: 'risks' })}</div>
                        <Popover
                          title={t(RISKS[risk].title, { ns: 'risks' })}
                          content={t(RISKS[risk].explanation, { ns: 'risks' })}
                        />
                      </div>
                      <div className={classes.riskCategory}>
                        {t(RISKS[risk].category, { ns: 'risks' })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Fragment>
          ))}
        </div>
        <Collapsable
          titleClassName={classes.titleClassName}
          containerClassName={classes.howItWorksContainer}
          title={t('How-It-Works')}
        >
          <div className={classes.notes}>
            <p>{t('Safety-HigherSafer')}</p>
            <p>{t('Safety-BeefySecure')}</p>
          </div>
        </Collapsable>
      </CardContent>
    </Card>
  );
}

export const SafetyCard = React.memo(SafetyCardComponent);
