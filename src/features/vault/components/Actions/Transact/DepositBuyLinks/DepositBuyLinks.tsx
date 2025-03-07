import { useTranslation } from 'react-i18next';
import { selectVaultById } from '../../../../../data/selectors/vaults.ts';
import { styles } from './styles.ts';
import { useAppSelector } from '../../../../../../store.ts';
import { LinkButton } from '../../../../../../components/LinkButton/LinkButton.tsx';
import { css, type CssStyles } from '@repo/styles/css';
import { memo } from 'react';
import {
  selectTransactNumTokens,
  selectTransactVaultId,
} from '../../../../../data/selectors/transact.ts';

export type DepositBuyLinksProps = {
  css?: CssStyles;
};
export const DepositBuyLinks = memo(function DepositBuyLinks({
  css: cssProp,
}: DepositBuyLinksProps) {
  const { t } = useTranslation();
  const vaultId = useAppSelector(selectTransactVaultId);
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const numTokenOptions = useAppSelector(selectTransactNumTokens);

  const showLinks = vault.addLiquidityUrl && numTokenOptions === 1;

  if (!showLinks) {
    return null;
  }

  return (
    <div className={css(styles.btnContainer, cssProp)}>
      {vault.addLiquidityUrl && (
        <LinkButton href={vault.addLiquidityUrl} text={t('Transact-BuildLp')} />
      )}
    </div>
  );
});
