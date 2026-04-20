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
            <Title data-slot="title">
              <TitlePrefix>
                {t('Dashboard-Title')}
                {address && <Slash> /</Slash>}
              </TitlePrefix>
              {address ?
                <ShortAddress address={address} addressLabel={addressLabel} />
              : null}
            </Title>
            <AddressInputContainer data-slot="search">
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    lg: {
      //14px + 4px
      paddingInline: '18px',
    },
    // on mobile, when the search input is focused or has a value, hide the title
    // so the input can take the full row.
    smDown: {
      '&:has([data-search-active="true"]) > [data-slot="title"]': {
        display: 'none',
      },
      '&:has([data-search-active="true"]) > [data-slot="search"]': {
        flexGrow: 1,
        flexShrink: 1,
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
    minWidth: 0,
    // mobile collapsed: don't shrink (so the icon trigger stays visible)
    flexShrink: 0,
    sm: {
      // tablet+: allow the search area to shrink so the input's growth
      // is bounded by the available space next to the title
      flexShrink: 1,
    },
  },
});
