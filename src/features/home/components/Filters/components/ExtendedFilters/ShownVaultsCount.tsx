import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../../data/store/hooks.ts';
import {
  selectFilteredVaultCount,
  selectTotalVaultCount,
} from '../../../../../data/selectors/filtered-vaults.ts';
import { styled } from '@repo/styles/jsx';

export const ShownVaultsCount = memo(function ShownVaultsCount() {
  const { t } = useTranslation();
  const filteredVaultCount = useAppSelector(selectFilteredVaultCount);
  const totalVaultCount = useAppSelector(selectTotalVaultCount);

  return (
    <ShownVaults>
      {t('Filter-ShowingVaults', {
        number: filteredVaultCount,
        count: totalVaultCount,
      })}
    </ShownVaults>
  );
});

const ShownVaults = styled('div', {
  base: {
    textStyle: 'body.medium',
    color: 'text.middle',
  },
});
