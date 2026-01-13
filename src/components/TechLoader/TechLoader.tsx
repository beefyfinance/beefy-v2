import { memo } from 'react';
import loadingImage from '../../images/tech-loader.gif';
import { PageLayout } from '../PageLayout/PageLayout.tsx';
import { useTranslation } from 'react-i18next';
import { styled } from '@repo/styles/jsx';

export type TechLoaderProps = {
  text?: string;
};

export const TechLoader = memo(function TechLoader({ text }: TechLoaderProps) {
  return (
    <Centered>
      <img alt="Loading..." src={loadingImage} width={718 / 2} height={718 / 2} />
      {text && <Text>{text}</Text>}
    </Centered>
  );
});

export const FullscreenTechLoader = memo(function FullscreenTechLoader({ text }: TechLoaderProps) {
  const { t } = useTranslation();

  return (
    <PageLayout
      content={
        <Fullscreen>
          <TechLoader text={text === undefined ? t('Loading-Default') : text} />
        </Fullscreen>
      }
    />
  );
});

const Centered = styled('div', {
  base: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '1 1 auto',
  },
});

const Fullscreen = styled('div', {
  base: {
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    minHeight: '100vh',
    width: '100%',
  },
});

const Text = styled('div', {
  base: {
    textStyle: 'body.medium',
  },
});
