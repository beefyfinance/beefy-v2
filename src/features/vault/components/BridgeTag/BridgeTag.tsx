import { makeStyles } from '@material-ui/core';
import type { MouseEventHandler, ReactNode } from 'react';
import { forwardRef, memo, useCallback } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { styles } from './styles';
import type { BridgeEntity } from '../../../data/entities/bridge';
import clsx from 'clsx';
import type { TooltipProps } from '../../../../components/Tooltip';
import { Tooltip } from '../../../../components/Tooltip';
import { getBridgeIcon } from '../../../../helpers/bridgeProviderSrc';
import type { ChainEntity } from '../../../data/entities/chain';
import { getNetworkSrc } from '../../../../helpers/networkSrc';
import type { HandleTokenTooltipInfoClick } from '../AssetsCard';

const useStyles = makeStyles(styles);

export type NativeTagProps = {
  chain: ChainEntity;
  handleClick: HandleTokenTooltipInfoClick;
};

export const NativeTag = memo<NativeTagProps>(function NativeTag({ chain, handleClick }) {
  const { t } = useTranslation();
  const classes = useStyles();
  const icon = getNetworkSrc(chain.id);

  return (
    <div className={classes.tag} onClick={handleClick({ native: true, bridge: null })}>
      {icon ? <img src={icon} alt={chain.name} className={classes.icon} width={24} /> : null}
      {t('TokenBridge-native')}
    </div>
  );
});

export type BridgeTagProps = {
  bridge: BridgeEntity;
  handleClick: HandleTokenTooltipInfoClick;
};
export const BridgeTag = memo<BridgeTagProps>(function BridgeTag({ bridge, handleClick }) {
  const classes = useStyles();
  const icon = getBridgeIcon(bridge.id);

  return (
    <div className={classes.tag} onClick={handleClick({ native: false, bridge })}>
      {icon ? <img src={icon} alt={bridge.name} className={classes.icon} width={24} /> : null}
      {bridge.tagName}
    </div>
  );
});

export type NativeTooltipProps = {
  chain: ChainEntity;
};
export const NativeTooltipContent = memo<NativeTooltipProps>(function NativeTooltip({ chain }) {
  const { t } = useTranslation();
  return <TagTooltip content={t('TokenBridge-Tooltip-native', { chain: chain.name })} />;
});

export type BridgeTooltipProps = {
  bridge: BridgeEntity;
  chain: ChainEntity;
};
export const BridgeTooltipContent = memo<BridgeTooltipProps>(function BridgeTooltip({
  bridge,
  chain,
}) {
  const { t } = useTranslation();
  const classes = useStyles();
  const onClick = useCallback<MouseEventHandler<HTMLAnchorElement>>(e => {
    e.stopPropagation(); // allow link to open (stop event being cancelled in tooltip)
  }, []);

  return (
    <TagTooltip
      content={
        <Trans
          t={t}
          i18nKey={'TokenBridge-Tooltip-bridge'}
          values={{ chain: chain.name, bridge: bridge.name }}
          components={{
            website: (
              <a
                href={bridge.website}
                className={classes.link}
                target={'_blank'}
                rel={'noopener'}
                onClick={onClick}
              />
            ),
          }}
        />
      }
    />
  );
});

export type TagTooltipProps = {
  content: ReactNode;
};
const TagTooltip = memo<TagTooltipProps>(function BridgeTooltip({ content }) {
  const classes = useStyles();
  return <div className={classes.tooltip}>{content}</div>;
});

type TagWithTooltipProps = {
  className?: string;
  children: ReactNode;
} & TooltipProps;

export const TagWithTooltip = memo(
  forwardRef<HTMLDivElement, TagWithTooltipProps>(function TagWithTooltip(
    { children, className, triggerClass, ...rest },
    ref
  ) {
    const classes = useStyles();
    return (
      <Tooltip
        placement="top"
        triggerClass={clsx(classes.tag, className, triggerClass)}
        ref={ref}
        {...rest}
      >
        {children}
      </Tooltip>
    );
  })
);
