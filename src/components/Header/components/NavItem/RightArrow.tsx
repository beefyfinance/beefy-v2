import { styled } from '@repo/styles/jsx';
import type { FunctionComponent, SVGProps } from 'react';
import type { RecipeVariantRecord } from '@repo/styles/types';
import ArrowForwardIosRounded from '../../../../images/icons/mui/ArrowForwardIosRounded.svg?react';

export const RightArrow = styled<FunctionComponent<SVGProps<SVGSVGElement>>, RecipeVariantRecord>(
  ArrowForwardIosRounded,
  {
    base: {
      height: '12px',
      marginLeft: 'auto',
    },
  }
);
