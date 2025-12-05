import { css } from '@repo/styles/css';
import { memo, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { IconWithBasicTooltip } from '../../../../components/Tooltip/IconWithBasicTooltip.tsx';
import InfoRoundedSquare from '../../../../images/icons/info-rounded-square.svg?react';
import Tick from '../../../../images/icons/tick.svg?react';
import Cross from '../../../../images/icons/cross.svg?react';
import { styled } from '@repo/styles/jsx';

type RiskItemProps = {
  risk: string;
  mode: 'passed' | 'failed';
};

export const RiskItem = memo(function ({ risk, mode }: RiskItemProps) {
  const { t } = useTranslation();
  const descriptionComponents = useMemo(() => {
    const tooltip = t(`Checklist-${risk}-${mode}-Tooltip`, { ns: 'risks' });
    if (!tooltip) {
      return undefined;
    }
    return {
      Tooltip: <Tooltip text={tooltip} />,
    };
  }, [t, risk, mode]);
  const Icon = mode === 'failed' ? Cross : Tick;

  return (
    <Layout data-risk={risk} mode={mode}>
      <Icon width={20} height={20} className={iconClass} />
      <div>
        <Title>{t(`Checklist-${risk}-${mode}-Title`, { ns: 'risks' })}</Title>
        {' - '}
        <Trans
          t={t}
          i18nKey={`Checklist-${risk}-${mode}-Description`}
          ns="risks"
          components={descriptionComponents}
        />
      </div>
    </Layout>
  );
});

const Title = styled('span', {
  base: {
    color: 'var(--mode-color)',
  },
});

const Layout = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    color: 'text.middle',
    paddingRight: '12px', // 12px icon gap
    textStyle: 'body.medium',
    sm: {
      paddingRight: '32px', // 20px icon + 12px gap
    },
  },
  variants: {
    mode: {
      passed: {
        '--mode-color': 'colors.indicators.success.fg',
      },
      failed: {
        '--mode-color': 'colors.indicators.error.fg',
      },
    },
  },
});

const iconClass = css({
  color: 'var(--mode-color)',
  flex: '0 0 20px',
  marginTop: '2px',
});

type TooltipProps = {
  text: string;
};

const Tooltip = memo(function ({ text }: TooltipProps) {
  return (
    <IconWithBasicTooltip
      title={text}
      Icon={InfoRoundedSquare}
      iconCss={tooltipIconCss}
      iconSize={11}
    />
  );
});

const tooltipIconCss = css.raw({
  display: 'inline',
});
