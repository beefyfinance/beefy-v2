import { memo, type ReactNode, useState } from 'react';
import { Container } from '../../../components/Container/Container.tsx';
import { ShortAddress } from './ShortAddress/ShortAddress.tsx';
import { AddressInput } from './AddressInput/AddressInput.tsx';
import { useTranslation } from 'react-i18next';
import { styled } from '@repo/styles/jsx';

type AddressProps = {
  address: string;
  addressLabel?: string;
};

type HeaderProps = {
  children?: ReactNode;
} & AddressProps;

export const Header = memo(function Header({ children, ...addressProps }: HeaderProps) {
  return (
    <HeaderContainer>
      <Container maxWidth="lg">
        <Content>
          <TitleSearchRow {...addressProps} />
          {children}
        </Content>
      </Container>
    </HeaderContainer>
  );
});

const TitleSearchRow = memo(function ({ address, addressLabel }: AddressProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  return (
    <TitleSearch expanded={expanded}>
      <Title collapsed={expanded}>
        <TitlePrefix>
          {t('Dashboard-Title')}
          {address && <Slash> /</Slash>}
        </TitlePrefix>
        {address ?
          <ShortAddress address={address} addressLabel={addressLabel} />
        : null}
      </Title>
      <AddressInput variant="transparent" active={expanded} setActive={setExpanded} />
    </TitleSearch>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    lg: {
      paddingInline: '18px',
    },
  },
  variants: {
    expanded: {
      true: {
        smDown: {
          gap: 0,
        },
      },
    },
  },
});

const Title = styled('div', {
  base: {
    minWidth: 0,
    overflow: 'hidden',
    display: 'flex',
    columnGap: '8px',
    alignItems: 'center',
    textStyle: 'label',
    fontWeight: 500,
    flexShrink: 1,
  },
  variants: {
    collapsed: {
      true: {
        smDown: {
          flexBasis: 0,
        },
      },
    },
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
