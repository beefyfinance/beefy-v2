import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@repo/styles/jsx';

export const TitleComponent = memo(function TitleComponent({
  hasAnyError,
  text,
  mobilelist,
}: {
  hasAnyError: boolean;
  text: string;
  mobilelist?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <TitleContainer mobilelist={mobilelist}>
      <Title mobilelist={mobilelist} variant={hasAnyError ? 'warning' : 'success'}>
        <TextTitle>{t(text)}</TextTitle>
        <TextTitle>
          {hasAnyError ? t('NetworkStatus-Data-Error') : t('NetworkStatus-Data-Success')}
        </TextTitle>
      </Title>
    </TitleContainer>
  );
});

const TitleContainer = styled('div', {
  base: {
    color: 'text.light',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  variants: {
    mobilelist: {
      true: {
        paddingTop: '16px',
      },
      false: {
        paddingBlock: '10px 6px',
        paddingInline: '12px',
        sm: {
          padding: '10px 12px',
        },
      },
    },
  },
  defaultVariants: {
    mobilelist: false,
  },
});

const Title = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    color: 'text.light',
    textStyle: 'body.md',
  },
  variants: {
    mobilelist: {
      true: {
        textStyle: 'body',
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
    mobilelist: false,
  },
});

const TextTitle = styled('div', {
  base: {
    textStyle: 'inherit',
    color: 'inherit',
  },
});
