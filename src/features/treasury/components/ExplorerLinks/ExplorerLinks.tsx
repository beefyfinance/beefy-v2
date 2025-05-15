import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { DropdownContent } from '../../../../components/Dropdown/DropdownContent.tsx';
import { DropdownProvider } from '../../../../components/Dropdown/DropdownProvider.tsx';
import { DropdownTrigger } from '../../../../components/Dropdown/DropdownTrigger.tsx';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { useAppSelector } from '../../../data/store/hooks.ts';
import iconExternalLink from '../../../../images/icons/external-link.svg';
import type { ChainEntity } from '../../../data/entities/chain.ts';
import { selectTreasuryWalletAddressesByChainId } from '../../../data/selectors/treasury.ts';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

interface ExplorerLinkProps {
  chainId: ChainEntity['id'];
}

export const ExplorerLinks = memo(function ExplorerLinks({ chainId }: ExplorerLinkProps) {
  const { t } = useTranslation();
  const classes = useStyles();
  const wallets = useAppSelector(state => selectTreasuryWalletAddressesByChainId(state, chainId));

  return (
    <DropdownProvider variant="dark" arrowEnabled={true}>
      <DropdownTrigger.button>
        <img className={classes.icon} src={iconExternalLink} alt="external link" />
      </DropdownTrigger.button>
      <DropdownContent>
        {wallets.map(wallet => (
          <a key={wallet.address} href={wallet.url} target="_blank" className={classes.item}>
            {t(`Treasury-${wallet.name}`)}
            <img src={iconExternalLink} alt="external link" />
          </a>
        ))}
      </DropdownContent>
    </DropdownProvider>
  );
});
