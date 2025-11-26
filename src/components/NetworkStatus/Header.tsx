import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@repo/styles/jsx';
import type { LoaderNotifications } from '../../features/data/selectors/data-loader-helpers.ts';

type HeaderProps = {
  notifications: LoaderNotifications;
  isMobile?: boolean;
};

// Header is common to Notification and Details (mobile and desktop)
export const Header = memo(function Header({ notifications, isMobile = false }: HeaderProps) {
  const { t } = useTranslation();
  const errorKeys = useMemo(() => {
    return Object.keys(notifications).filter(
      key => notifications[key as keyof LoaderNotifications]?.any === true
    );
  }, [notifications]);
  const hasAnyError = errorKeys.length > 0;

  return (
    <Layout isMobile={isMobile} variant={hasAnyError ? 'warning' : 'success'}>
      <Title>
        {hasAnyError ? t('NetworkStatus-Title-Error') : t('NetworkStatus-Title-Success')}
      </Title>
      {errorKeys.length > 0 && (
        <Errors>
          {errorKeys.map(key => (
            <div key={key}>- {t(`NetworkStatus-Error-${key}`)}</div>
          ))}
        </Errors>
      )}
    </Layout>
  );
});

const Layout = styled('div', {
  base: {
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
    color: 'text.light',
    textStyle: 'body.md',
  },
  variants: {
    isMobile: {
      true: {
        paddingTop: '16px',
        textStyle: 'body',
      },
      false: {
        paddingBlock: '10px 6px',
        paddingInline: '12px',
        sm: {
          padding: '10px 12px',
        },
      },
    },
    variant: {
      success: {
        color: 'green.40',
      },
      warning: {
        color: 'orange.40',
      },
    },
  },
  defaultVariants: {
    variant: 'success',
    isMobile: false,
  },
});

const Title = styled('div', {
  base: {
    color: 'inherit',
  },
});

const Errors = styled('div', {
  base: {
    color: 'inherit',
    textStyle: 'body.md',
  },
});
