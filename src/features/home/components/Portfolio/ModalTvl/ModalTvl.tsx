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
    <Card width="lg">
      <CardHeader>
        <CardTitle>{t('TVL-bychain')}</CardTitle>
        <CardIconButton onClick={close}>
          <CloseIcon />
        </CardIconButton>
      </CardHeader>
      <StyledCardContent>
        <Chains />
        <Button onClick={close} fullWidth={true}>
          {t('Close')}
        </Button>
      </StyledCardContent>
    </Card>
  );
});

const StyledCardContent = styled(CardContent, {
  base: {
    gap: '24px',
    minHeight: '200px',
    flexShrink: 1,
  },
});
