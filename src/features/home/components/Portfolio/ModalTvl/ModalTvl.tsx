import { memo } from 'react';
import { Card } from '../../../../vault/components/Card/Card.tsx';
import { CardContent } from '../../../../vault/components/Card/CardContent.tsx';
import { CardHeader } from '../../../../vault/components/Card/CardHeader.tsx';
import { CardTitle } from '../../../../vault/components/Card/CardTitle.tsx';
import CloseIcon from '../../../../../images/icons/mui/Close.svg?react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../../../components/Button/Button.tsx';
import { styled } from '@repo/styles/jsx';
import { CardIconButton } from '../../../../vault/components/Card/CardIconButton.tsx';
import { Chains } from './Chains.tsx';

export type ModalTvlProps = {
  close: () => void;
};

export const ModalTvl = memo<ModalTvlProps>(function ModalTvl({ close }: ModalTvlProps) {
  const { t } = useTranslation();

  return (
    <StyledCard width="lg">
      <StyledCardHeader>
        <CardTitle>{t('TVL-bychain')}</CardTitle>
        <CardIconButton onClick={close}>
          <CloseIcon />
        </CardIconButton>
      </StyledCardHeader>
      <StyledCardContent>
        <Chains />
        <Button onClick={close} fullWidth={true}>
          {t('Close')}
        </Button>
      </StyledCardContent>
    </StyledCard>
  );
});

const StyledCardHeader = styled(CardHeader, {
  base: {
    borderTopRadius: '0',
    sm: {
      borderTopRadius: '12px',
    },
  },
});

const StyledCard = styled(Card, {
  base: {
    height: '100dvh',
    position: 'fixed',
    borderRadius: '0',
    bottom: 0,
    left: 0,
    right: 0,
    sm: {
      position: 'static',
      height: 'auto',
      borderRadius: '12px',
    },
  },
});

const StyledCardContent = styled(CardContent, {
  base: {
    gap: '24px',
    minHeight: '200px',
    flexShrink: 1,
  },
});
