import HeaderLogoDesktop from '../../../../images/bifi-logos/header-logo.svg?react';
import HeaderLogoMobile from '../../../../images/bifi-logos/header-logo-notext.svg?react';

import { Link } from 'react-router';
import { memo } from 'react';
import { styled } from '@repo/styles/jsx';
import { useMediaQuery } from '../../../MediaQueries/useMediaQuery.ts';

export const LogoLink = memo(function LogoLink() {
  const showSmallLogo = useMediaQuery('(max-width: 450px)', false);

  return (
    <StyledLink to="/">
      {showSmallLogo ?
        <HeaderLogoMobile />
      : <HeaderLogoDesktop />}
    </StyledLink>
  );
});

const StyledLink = styled(Link, {
  base: {
    display: 'block',
    '& >svg': {
      height: '40px',
      display: 'block',
      '@media (min-width: 451px)': {
        width: '105px',
      },
    },
  },
});
