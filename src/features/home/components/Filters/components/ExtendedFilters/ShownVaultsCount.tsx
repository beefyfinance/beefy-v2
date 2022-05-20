import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../../../store';
import {
  selectFilteredVaultCount,
  selectTotalVaultCount,
} from '../../../../../data/selectors/filtered-vaults';

export type ShownVaultsCountProps = {
  className?: string;
};

export const ShownVaultsCount = memo<ShownVaultsCountProps>(function ShownVaultsCount({
  className,
}) {
  const { t } = useTranslation();
  const filteredVaultCount = useAppSelector(selectFilteredVaultCount);
  const totalVaultCount = useAppSelector(selectTotalVaultCount);

  return (
    <div className={className}>
      {t('Filter-ShowingVaults', {
        number: filteredVaultCount,
        count: totalVaultCount,
      })}
    </div>
  );
});
