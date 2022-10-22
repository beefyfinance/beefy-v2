import { makeStyles } from '@material-ui/styles';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../store';
import { selectUserVaultBalance } from '../../../data/selectors/balance';
import { ChainTable } from '../ChainTable';
import { Section } from '../Section';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export const UserVaults = memo(function () {
  const { t } = useTranslation();
  const vaults = useAppSelector(selectUserVaultBalance);
  const classes = useStyles();
  return (
    <Section title={t('Your Vaults')}>
      <div className={classes.tablesContainer}>
        {Object.keys(vaults).map(chainId => {
          return <ChainTable chainId={chainId} data={vaults[chainId]} />;
        })}
      </div>
    </Section>
  );
});
