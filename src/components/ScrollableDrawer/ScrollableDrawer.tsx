import { styled } from '@repo/styles/jsx';
import {
  type FC,
  memo,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Drawer } from '../Modal/Drawer.tsx';
import { type CssStyles } from '@repo/styles/css';

interface ContentComponents {
  css?: CssStyles;
}

interface ScrollabeDrawerProps {
  open: boolean;
  onClose: () => void;
  mainChildren: ReactNode;
  footerChildren: ReactNode;

  hideShadow?: boolean;
  mobileSpacingSize?: number;
  MainComponent?: FC<ContentComponents & { ref: RefObject<HTMLDivElement> }>;
  LayoutComponent?: FC<ContentComponents>;
  FooterComponent?: FC<ContentComponents>;
}

export const ScrollableDrawer = memo<ScrollabeDrawerProps>(function ScrollableDrawer({
  open,
  onClose,
  mainChildren,
  footerChildren,
  hideShadow,
  mobileSpacingSize = 28,
  MainComponent = Main,
  LayoutComponent = Layout,
  FooterComponent = Footer,
}) {
  const [shadowOpacity, setShadowOpacity] = useState(100);
  const mainRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (mainRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = mainRef.current;
      const maxScroll = scrollHeight - clientHeight;
      const scrollPercentage = scrollTop / maxScroll;
      const opacity = Math.max(0, Math.min(100, 100 - scrollPercentage * 100));
      setShadowOpacity(opacity);
    }
  }, []);

  useEffect(() => {
    const mainElement = mainRef.current;
    if (mainElement) {
      mainElement.addEventListener('scroll', handleScroll);
      return () => mainElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  return (
    <Drawer layer={1} scrollable={false} open={open} onClose={onClose} position="bottom">
      <LayoutComponent>
        <MainComponent ref={mainRef}>
          {mainChildren}
          {mobileSpacingSize > 0 && <MobileSpacing style={{ height: `${mobileSpacingSize}px` }} />}
        </MainComponent>
        {!hideShadow && <Shadow style={{ opacity: `${shadowOpacity}%` }} />}
        <FooterComponent>{footerChildren}</FooterComponent>
      </LayoutComponent>
    </Drawer>
  );
});

export const Layout = styled('div', {
  base: {
    backgroundColor: 'background.content.darkest',
    height: '100dvh',
    maxHeight: '100dvh',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
  },
});

export const Main = styled('div', {
  base: {
    flex: '1 1 auto',
    overflowY: 'auto',
    position: 'relative',
  },
});

export const Footer = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    padding: '0px 20px 24px 20px',
    gap: '12px',
    justifyContent: 'space-between',
  },
});

const Shadow = styled('div', {
  base: {
    position: 'absolute',
    pointerEvents: 'none',
    transition: 'opacity 0.2s linear',
    left: '0',
    right: '0',
    bottom: '72px',
    height: '55px',
    background: 'linear-gradient(0deg, #111321 2.91%, rgba(17, 19, 33, 0) 100%)',
  },
});

const MobileSpacing = styled('div', {
  base: {},
});
