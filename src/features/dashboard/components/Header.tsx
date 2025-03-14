import { memo, type ReactNode } from 'react';
import { css } from '@repo/styles/css';
import { Container } from '../../../components/Container/Container.tsx';
import { ShortAddress } from './ShortAddress/ShortAddress.tsx';
import { AddressInput } from './AddressInput/AddressInput.tsx';
import { useTranslation } from 'react-i18next';

type HeaderProps = {
  address: string;
  addressLabel?: string;
  children?: ReactNode;
};

export const Header = memo(function Header({ address, addressLabel, children }: HeaderProps) {
  const { t } = useTranslation();

  return (
    <div className={headerClass}>
      <Container maxWidth="lg">
        <div className={titleSearchClass}>
          <div className={titleClass}>
            {t('Dashboard-Title')}
            <ShortAddress address={address} addressLabel={addressLabel} />
          </div>
          <div>
            <AddressInput />
          </div>
        </div>
        {children}
      </Container>
    </div>
  );
});

const headerClass = css({
  backgroundColor: 'background.header',
  padding: '24px 0px',
  lg: {
    padding: '24px 0 48px 0',
  },
});

const titleSearchClass = css({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '24px',
  mdDown: {
    flexDirection: 'column',
    rowGap: '12px',
  },
});

const titleClass = css({
  display: 'flex',
  columnGap: '8px',
  alignItems: 'baseline',
  textStyle: 'h1',
});
