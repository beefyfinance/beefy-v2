import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { styled } from '@repo/styles/jsx';
import FreeZapBoltIcon from '../../../../images/icons/freeZapBolt.svg?react';
import { CardContent } from '../Card/CardContent.tsx';
import { CardHeader } from '../Card/CardHeader.tsx';

const TEXT = {
  vault: 'Vault-FreeZap-Text-Vault',
  pool: 'Vault-FreeZap-Text-Pool',
} as const;

type FreeZapPromotionCardProps = {
  /** the one CLM yield mode the campaign covers */
  side?: keyof typeof TEXT;
};

export const FreeZapPromotionCard = memo(function FreeZapPromotionCard({
  side,
}: FreeZapPromotionCardProps) {
  const { t } = useTranslation();

  return (
    <div>
      <CardHeader>
        <Title>
          {t('Vault-FreeZap-Title')}
          <span>{t('Vault-FreeZap-By')}</span>
          <FreeZapBoltIcon />
        </Title>
      </CardHeader>
      <Content>
        <Text>{t(side ? TEXT[side] : 'Vault-FreeZap-Text')}</Text>
      </Content>
    </div>
  );
});

const Title = styled('h2', {
  base: {
    textStyle: 'h2',
    margin: '0',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: 'text.freeZap',
    '& span': {
      color: 'text.light',
    },
    '& svg': {
      width: '20px',
      height: '20px',
    },
  },
});

const Content = styled(CardContent, {
  base: {
    rowGap: '16px',
    backgroundColor: 'background.content',
  },
});

const Text = styled('p', {
  base: {
    color: 'text.middle',
  },
});
