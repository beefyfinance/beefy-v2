import headerLogoDesktop from '../../../../images/bifi-logos/header-logo.svg';
import headerLogoMobile from '../../../../images/bifi-logos/header-logo-notext.svg';
import { Link } from 'react-router';
import { memo } from 'react';
import { css } from '@repo/styles/css';

export const LogoLink = memo(function LogoLink() {
  const linkClass = css({ display: 'block' });
  const imgClass = css({ height: '40px', display: 'block' });

  return (
    <Link className={linkClass} to="/">
      <picture>
        <source media="(min-width: 500px)" srcSet={headerLogoDesktop} />
        <img alt="Beefy" src={headerLogoMobile} height={40} className={imgClass} />
      </picture>
    </Link>
  );
});
