import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@repo/styles/jsx';

export const TitleComponent = memo(function TitleComponent({
  hasAnyError,
  text,
}: {
  hasAnyError: boolean;
  text: string;
}) {
  const { t } = useTranslation();

  return (
    <TitleContainer>
      <Title variant={hasAnyError ? 'warning' : 'success'}>
        <TextTitle>{text}</TextTitle>
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
    backgroundColor: 'inherit',
    borderTopLeftRadius: 'inherit',
    borderTopRightRadius: 'inherit',
    paddingBlock: '10px 6px',
    paddingInline: '12px',
    sm: {
      padding: '10px 12px 6px 12px',
    },
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
  },
});

const TextTitle = styled('div', {
  base: {
    textStyle: 'inherit',
    color: 'inherit',
  },
});
