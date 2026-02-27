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
              <TitlePrefix>
                {t('Dashboard-Title')}
                {address && <Slash> /</Slash>}
              </TitlePrefix>
              {address ?
                <ShortAddress address={address} addressLabel={addressLabel} />
              : null}
            </Title>
            <AddressInputContainer>
              <AddressInput variant="transparent" />
            </AddressInputContainer>
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
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    alignItems: 'center',
    gap: '2px',
    lg: {
      //14px + 4px
      paddingInline: '18px',
    },
  },
});

const Title = styled('div', {
  base: {
    width: '100%',
    minWidth: 0,
    overflow: 'hidden',
    display: 'flex',
    columnGap: '8px',
    alignItems: 'center',
    textStyle: 'label',
    fontWeight: 500,
  },
});

const TitlePrefix = styled('span', {
  base: {
    flexShrink: 0,
    color: 'text.light',
  },
});

const Slash = styled('span', {
  base: {
    color: 'text.dark',
  },
});

const AddressInputContainer = styled('div', {
  base: {
    display: 'flex',
    justifyContent: 'flex-end',
    width: '100%',
    minWidth: 0,
  },
});
