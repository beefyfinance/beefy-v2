import { styled } from '@repo/styles/jsx';
import { Fragment, memo } from 'react';
import { useTranslation } from 'react-i18next';

export type InterestTooltipContentProps = {
  rows: {
    label: string | string[];
    value: string;
    labelTextParams?: Record<string, string>;
  }[];
  highLightLast?: boolean;
};

export const InterestTooltipContent = memo(function InterestTooltipContent({
  rows,
  highLightLast = true,
}: InterestTooltipContentProps) {
  const { t } = useTranslation();

  return (
    <Rows>
      {rows.map(({ label, value, labelTextParams }) => (
        <Fragment key={typeof label === 'string' ? label : label[0]}>
          <Label highLightLast={highLightLast}>{t(label, labelTextParams)}</Label>
          <Value highLightLast={highLightLast}>{t(value)}</Value>
        </Fragment>
      ))}
    </Rows>
  );
});

const Rows = styled('div', {
  base: {
    textStyle: 'body',
    display: 'grid',
    rowGap: '2px',
    columnGap: '48px',
    gridTemplateColumns: '1fr auto',
  },
});

const Label = styled('div', {
  base: {
    color: 'colorPalette.text.label',
  },
  variants: {
    highLightLast: {
      true: {
        '&:nth-last-child(2)': {
          fontWeight: 'medium',
          color: 'colorPalette.text.title',
        },
      },
    },
  },
});

const Value = styled('div', {
  base: {
    color: 'colorPalette.text.item',
    textAlign: 'right',
  },
  variants: {
    highLightLast: {
      true: {
        '&:last-child': {
          fontWeight: 'medium',
          color: 'colorPalette.text.title',
        },
      },
    },
  },
});
