import { memo, type ReactNode } from 'react';
import { Container } from '../../../components/Container/Container.tsx';
import { ShortAddress } from './ShortAddress/ShortAddress.tsx';
import { AddressInput } from './AddressInput/AddressInput.tsx';
import { useTranslation } from 'react-i18next';
import { styled } from '@repo/styles/jsx';

type HeaderProps = {
  address: string;
  addressLabel?: string;
  children?: ReactNode;
};

export const Header = memo(function Header({ address, addressLabel, children }: HeaderProps) {
  const { t } = useTranslation();

  return (
    <HeaderContainer>
      <Container maxWidth="lg">
        <Content>
          <TitleSearch>
            <Title>
              {t('Dashboard-Title')}
              <span>/</span>
              <ShortAddress address={address} addressLabel={addressLabel} />
            </Title>
            <div>
              <AddressInput variant="transparent" />
            </div>
          </TitleSearch>
          {children}
        </Content>
      </Container>
    </HeaderContainer>
  );
});

const HeaderContainer = styled('div', {
  base: {
    backgroundColor: 'background.header',
    paddingBlock: '12px 16px',
    sm: {
      paddingBlock: '8px 24px',
    },
  },
});

const Content = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
});

const TitleSearch = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',

    gap: '6px',
    lg: {
      //14px + 4px
      paddingInline: '18px',
    },

    md: {
      justifyContent: 'space-between',
      flexDirection: 'row',
    },
  },
});

const Title = styled('div', {
  base: {
    display: 'flex',
    columnGap: '8px',
    alignItems: 'center',
    textStyle: 'label',
    fontWeight: 500,
    color: 'text.light',
    '& span': {
      color: 'text.dark',
    },
  },
});
