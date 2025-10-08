import headerLogoDesktop from '../../../../images/bifi-logos/header-logo.png';
import headerLogoMobile from '../../../../images/bifi-logos/header-logo-notext.png';

import { Link } from 'react-router';
import { memo } from 'react';
import { styled } from '@repo/styles/jsx';
import { useMediaQuery } from '../../../MediaQueries/useMediaQuery.ts';

export const LogoLink = memo(function LogoLink() {
  const showSmallLogo = useMediaQuery('(max-width: 380px)', false);

  return (
    <StyledLink to="/">
      {showSmallLogo ?
        <img src={headerLogoMobile} alt="Beefy" />
      : <img src={headerLogoDesktop} alt="Beefy" />}
    </StyledLink>
  );
});

const StyledLink = styled(Link, {
  base: {
    display: 'block',
    '& >svg, & >img': {
      height: '40px',
      display: 'block',
    },
  },
});
